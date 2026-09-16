from django.db import migrations, models
from django.utils.text import slugify


def populate_product_slugs(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    used_slugs = set(
        Product.objects.exclude(slug__isnull=True)
        .exclude(slug="")
        .values_list("slug", flat=True)
    )

    for product in Product.objects.all().order_by("id"):
        base_slug = slugify(product.title) or f"product-{product.id}"
        candidate = base_slug
        suffix = 2
        while candidate in used_slugs:
            candidate = f"{base_slug}-{suffix}"
            suffix += 1
        product.slug = candidate
        product.save(update_fields=["slug"])
        used_slugs.add(candidate)


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0004_order_orderitem_promocode_and_more"),
    ]

    operations = [
        # Migration 0004 removed the slug column but PostgreSQL can leave this
        # pattern-lookup index behind. Clear it before Django recreates slug.
        migrations.RunSQL(
            sql="DROP INDEX IF EXISTS products_product_slug_70d3148d_like",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AddField(
            model_name="product",
            name="slug",
            field=models.SlugField(
                blank=True, db_index=False, max_length=255, null=True
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="short_description",
            field=models.CharField(blank=True, default="", max_length=512),
        ),
        migrations.AddField(
            model_name="product",
            name="badge",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="product",
            name="course",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="product",
            name="format",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="product",
            name="rating",
            field=models.FloatField(default=4.5),
        ),
        migrations.AddField(
            model_name="product",
            name="pickup_note",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="product",
            name="delivery_note",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="product",
            name="highlights",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="product",
            name="cover_gradient",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.RunPython(populate_product_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="product",
            name="slug",
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
    ]
