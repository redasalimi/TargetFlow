from django.urls import path
from .views import RegisterView, LoginView, ChangePasswordView, ProfileView, UserListView, UserRoleView

urlpatterns = [
    path('register/',            RegisterView.as_view()),
    path('login/',               LoginView.as_view()),
    path('change-password/',     ChangePasswordView.as_view()),
    path('profile/',             ProfileView.as_view()),
    path('users/',               UserListView.as_view()),
    path('users/<int:user_id>/', UserRoleView.as_view()),
]
