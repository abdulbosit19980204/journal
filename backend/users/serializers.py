from rest_framework import serializers
from django.contrib.auth import get_user_model
from billing.models import UserSubscription

User = get_user_model()


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_id = serializers.IntegerField(source='plan.id', read_only=True)
    class Meta:
        model = UserSubscription
        fields = ('id', 'plan_id', 'plan_name', 'start_date', 'end_date', 'articles_used_this_month', 'is_active')

class UserSerializer(serializers.ModelSerializer):
    subscription = UserSubscriptionSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_verified', 'is_staff', 'is_superuser', 'bio', 'institution', 'profile_picture', 'balance', 'subscription')
        read_only_fields = ('is_verified', 'is_staff', 'is_superuser', 'balance')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
