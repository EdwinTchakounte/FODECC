"""
Blocs StreamField réutilisables sur l'ensemble du site.

Ces blocs sérialisent vers l'API v2 (clé `body` des pages) ; le front Next.js
mappe chaque `type` vers un composant React (voir frontend/src/components/StreamField).
"""
from wagtail import blocks
from wagtail.documents.blocks import DocumentChooserBlock
from wagtail.embeds.blocks import EmbedBlock
from wagtail.images.blocks import ImageChooserBlock


class HeadingBlock(blocks.StructBlock):
    text = blocks.CharBlock(label="Texte")
    level = blocks.ChoiceBlock(
        choices=[("h2", "Titre 2"), ("h3", "Titre 3"), ("h4", "Titre 4")],
        default="h2",
        label="Niveau",
    )

    class Meta:
        icon = "title"
        label = "Titre"


class CalloutBlock(blocks.StructBlock):
    """Encadré mis en avant (chiffre clé, message important, citation institutionnelle)."""
    style = blocks.ChoiceBlock(
        choices=[("info", "Information"), ("success", "Réussite"), ("warning", "Attention")],
        default="info",
        label="Style",
    )
    title = blocks.CharBlock(required=False, label="Titre")
    text = blocks.RichTextBlock(features=["bold", "italic", "link"], label="Texte")

    class Meta:
        icon = "help"
        label = "Encadré"


class ImageBlock(blocks.StructBlock):
    image = ImageChooserBlock(label="Image")
    caption = blocks.CharBlock(required=False, label="Légende")
    alt_text = blocks.CharBlock(required=False, label="Texte alternatif (accessibilité)")

    class Meta:
        icon = "image"
        label = "Image"


class GalleryBlock(blocks.StructBlock):
    images = blocks.ListBlock(ImageBlock(), label="Images")

    class Meta:
        icon = "image"
        label = "Galerie photos"


class DocumentDownloadBlock(blocks.StructBlock):
    """Bloc de téléchargement (rapport annuel, états financiers, texte juridique...)."""
    document = DocumentChooserBlock(label="Document")
    title = blocks.CharBlock(required=False, label="Intitulé affiché")
    description = blocks.CharBlock(required=False, label="Description courte")

    class Meta:
        icon = "doc-full"
        label = "Document à télécharger"


class CTABlock(blocks.StructBlock):
    """Appel à l'action : « Demander un financement », « Télécharger le rapport annuel »…"""
    label = blocks.CharBlock(label="Libellé du bouton")
    url = blocks.CharBlock(label="Lien (URL ou /chemin interne)")
    style = blocks.ChoiceBlock(
        choices=[("primary", "Principal"), ("secondary", "Secondaire")],
        default="primary",
        label="Style",
    )

    class Meta:
        icon = "link"
        label = "Bouton d'action"


class KeyFigureBlock(blocks.StructBlock):
    value = blocks.CharBlock(label="Valeur (ex. « 13 000 »)")
    unit = blocks.CharBlock(required=False, label="Unité / suffixe (ex. « producteurs »)")
    label = blocks.CharBlock(label="Libellé")

    class Meta:
        icon = "decimal"
        label = "Chiffre clé"


class KeyFiguresBlock(blocks.StructBlock):
    figures = blocks.ListBlock(KeyFigureBlock(), label="Chiffres clés")

    class Meta:
        icon = "decimal"
        label = "Bandeau de chiffres clés"


class AccordionItemBlock(blocks.StructBlock):
    question = blocks.CharBlock(label="Question / Titre")
    answer = blocks.RichTextBlock(label="Réponse / Contenu")

    class Meta:
        icon = "list-ul"
        label = "Élément d'accordéon"


class AccordionBlock(blocks.StructBlock):
    """Pour la FAQ et les pages riches en questions/réponses."""
    items = blocks.ListBlock(AccordionItemBlock(), label="Éléments")

    class Meta:
        icon = "list-ul"
        label = "Accordéon / FAQ"


class TableBlock(blocks.StructBlock):
    caption = blocks.CharBlock(required=False, label="Titre du tableau")
    rows = blocks.ListBlock(
        blocks.ListBlock(blocks.CharBlock(label="Cellule")),
        label="Lignes (la 1re ligne sert d'en-tête)",
    )

    class Meta:
        icon = "table"
        label = "Tableau"


class BodyStreamBlock(blocks.StreamBlock):
    """Corps de contenu flexible commun aux pages standard et aux articles."""
    heading = HeadingBlock()
    paragraph = blocks.RichTextBlock(
        features=["h2", "h3", "bold", "italic", "ol", "ul", "hr", "link", "document-link", "blockquote"],
        label="Paragraphe",
    )
    image = ImageBlock()
    gallery = GalleryBlock()
    embed = EmbedBlock(label="Média intégré (vidéo, etc.)")
    document = DocumentDownloadBlock()
    callout = CalloutBlock()
    cta = CTABlock()
    key_figures = KeyFiguresBlock()
    accordion = AccordionBlock()
    table = TableBlock()
    html = blocks.RawHTMLBlock(label="Code HTML (à éviter, réservé aux cas particuliers)")

    class Meta:
        block_counts = {}
