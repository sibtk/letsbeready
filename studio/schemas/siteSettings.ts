import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'brand', title: 'Brand'},
    {name: 'contact', title: 'Contact & Address'},
    {name: 'social', title: 'Social Links'},
    {name: 'seo', title: 'SEO / Sharing'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    // ===== BRAND =====
    defineField({
      name: 'site_name',
      title: 'Site Name',
      type: 'string',
      initialValue: "Let's Be Ready",
      group: 'brand',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      group: 'brand',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon (32x32 PNG or SVG)',
      type: 'image',
      group: 'brand',
    }),

    // ===== CONTACT =====
    defineField({
      name: 'contact_email',
      title: 'Contact Email',
      type: 'string',
      description: 'Used in all "Contact us" links across the site',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email'}).error('Must be a valid email'),
      group: 'contact',
    }),
    defineField({
      name: 'org_address',
      title: 'Organization Address (HTML allowed)',
      type: 'text',
      rows: 3,
      group: 'contact',
    }),

    // ===== SOCIAL =====
    defineField({
      name: 'social_facebook',
      title: 'Facebook URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'social_instagram',
      title: 'Instagram URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'social_youtube',
      title: 'YouTube URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'globalgiving_url',
      title: 'GlobalGiving Donation URL',
      type: 'url',
      group: 'social',
    }),

    // ===== SEO =====
    defineField({
      name: 'og_image',
      title: 'Default Social Sharing Image (1200x630)',
      type: 'image',
      description: 'Used as og:image when individual pages don\'t set their own',
      group: 'seo',
    }),

    // ===== FOOTER =====
    defineField({
      name: 'footer_description',
      title: 'Footer Description',
      type: 'text',
      rows: 3,
      group: 'footer',
    }),
    defineField({
      name: 'trust_pill_1',
      title: 'Trust Pill 1',
      type: 'string',
      initialValue: 'Verified 501(c)(3)',
      group: 'footer',
    }),
    defineField({
      name: 'trust_pill_2',
      title: 'Trust Pill 2',
      type: 'string',
      initialValue: '100% to Programs',
      group: 'footer',
    }),
    defineField({
      name: 'trust_pill_3',
      title: 'Trust Pill 3',
      type: 'string',
      initialValue: 'Since 2008',
      group: 'footer',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'}),
  },
})
