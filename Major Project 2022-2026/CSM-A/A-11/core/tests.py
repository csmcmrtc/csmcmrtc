from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile, UploadedDataset, TrainedModel

class UserProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.profile = UserProfile.objects.create(user=self.user, role='user')

    def test_user_profile_creation(self):
        self.assertEqual(self.profile.user.username, 'testuser')
        self.assertEqual(self.profile.role, 'user')
