"""
Crée un compte super-utilisateur de DÉVELOPPEMENT (idempotent).

⚠ Réservé au dev : la commande refuse de s'exécuter si `DEBUG` est faux.
Identifiants par défaut : admin / admin (surchargeables via les variables
d'environnement DEV_SUPERUSER_USER, DEV_SUPERUSER_PASSWORD, DEV_SUPERUSER_EMAIL).

    python manage.py create_dev_superuser
"""
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Crée (si absent) un super-utilisateur de développement — admin/admin par défaut."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError(
                "Refusé : DEBUG=False. En production, utilisez `createsuperuser`."
            )
        User = get_user_model()
        username = os.environ.get("DEV_SUPERUSER_USER", "admin")
        password = os.environ.get("DEV_SUPERUSER_PASSWORD", "admin")
        email = os.environ.get("DEV_SUPERUSER_EMAIL", "admin@fodecc.local")

        user, created = User.objects.get_or_create(
            username=username, defaults={"email": email, "is_staff": True, "is_superuser": True}
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Super-utilisateur de dev créé : {username} / {password}"))
        else:
            # On s'assure qu'il est bien superuser, mais on ne réécrit pas le mot de passe.
            if not (user.is_staff and user.is_superuser):
                user.is_staff = user.is_superuser = True
                user.save()
            self.stdout.write(f"Super-utilisateur '{username}' déjà présent.")
