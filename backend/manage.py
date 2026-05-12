#!/usr/bin/env python
"""Utilitaire de ligne de commande Django pour le backend Wagtail du FODECC."""
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:  # pragma: no cover
        raise ImportError(
            "Django est introuvable. Avez-vous activé le virtualenv "
            "et installé requirements.txt ?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
