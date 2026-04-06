from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from .models import UserProfile


def get_or_create_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.save()

        # Save profile with plan and role
        profile = get_or_create_profile(user)
        plan = request.data.get('account_type', 'starter')
        if plan not in ('starter', 'expert', 'business'):
            plan = 'starter'

        # First user becomes admin
        if User.objects.count() == 1:
            profile.role = 'admin'
        else:
            profile.role = 'viewer'

        profile.plan = plan
        profile.save()

        # Generate tokens for auto-login
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Compte cree avec succes',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'role': profile.role,
            'plan': profile.plan,
            'username': user.username
        }, status=201)


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Username ou mot de passe incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profile = get_or_create_profile(user)
        refresh = RefreshToken.for_user(user)

        return Response({
            "access_token":  str(refresh.access_token),
            "refresh_token": str(refresh),
            "token_type":    "bearer",
            "role":          profile.role,
            "plan":          profile.plan,
            "username":      user.username,
        })


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_pw = request.data.get('old_password')
        new_pw = request.data.get('new_password')
        if not request.user.check_password(old_pw):
            return Response({"error": "Mot de passe actuel incorrect"}, status=400)
        if len(new_pw) < 6:
            return Response({"error": "Mot de passe trop court"}, status=400)
        request.user.set_password(new_pw)
        request.user.save()
        return Response({"message": "Mot de passe modifie"})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        return Response({
            "username": request.user.username,
            "email":    request.user.email,
            "role":     profile.role,
            "plan":     profile.plan,
            "bio":      profile.bio,
            "avatar":   profile.avatar,
            "company":  profile.company,
            "phone":    profile.phone,
        })

    def patch(self, request):
        profile = get_or_create_profile(request.user)
        if 'company' in request.data:
            profile.company = request.data['company']
        if 'phone' in request.data:
            profile.phone = request.data['phone']
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        if 'avatar' in request.data:
            profile.avatar = request.data['avatar']
        # Allow username change
        if 'username' in request.data:
            new_username = request.data['username'].strip()
            if new_username and new_username != request.user.username:
                if User.objects.filter(username=new_username).exists():
                    return Response({"error": "Ce nom est deja utilise"}, status=400)
                request.user.username = new_username
                request.user.save()
        if 'email' in request.data:
            request.user.email = request.data['email']
            request.user.save()
        profile.save()
        return Response({"message": "Profil mis a jour", "username": request.user.username})


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        if profile.role != 'admin':
            return Response({"error": "Acces reserve aux administrateurs"}, status=403)
        users = []
        for u in User.objects.all().order_by('date_joined'):
            p = get_or_create_profile(u)
            users.append({
                "id":          u.id,
                "username":    u.username,
                "email":       u.email,
                "role":        p.role,
                "plan":        p.plan,
                "is_active":   u.is_active,
                "date_joined": u.date_joined,
            })
        return Response(users)


class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        me = get_or_create_profile(request.user)
        if me.role != 'admin':
            return Response({"error": "Acces refuse"}, status=403)
        try:
            u = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)
        p = get_or_create_profile(u)
        if 'role' in request.data:
            if request.data['role'] not in ('admin', 'manager', 'viewer'):
                return Response({"error": "Role invalide"}, status=400)
            p.role = request.data['role']
        if 'plan' in request.data:
            if request.data['plan'] not in ('starter', 'expert', 'business'):
                return Response({"error": "Plan invalide"}, status=400)
            p.plan = request.data['plan']
        p.save()
        return Response({"message": f"Utilisateur {u.username} mis a jour"})

    def delete(self, request, user_id):
        me = get_or_create_profile(request.user)
        if me.role != 'admin':
            return Response({"error": "Acces refuse"}, status=403)
        if request.user.id == user_id:
            return Response({"error": "Impossible de supprimer votre propre compte"}, status=400)
        try:
            User.objects.get(id=user_id).delete()
            return Response({"message": "Utilisateur supprime"})
        except User.DoesNotExist:
            return Response({"error": "Introuvable"}, status=404)
