import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'partnersPage',
  title: 'Partners Page',
  type: 'document',
  fields: [
    defineField({name: 'partners_eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'partners_heading',
      title: 'Heading (HTML allowed)',
      type: 'text',
      rows: 2,
    }),
    defineField({name: 'partners_intro', title: 'Intro Paragraph', type: 'text', rows: 4}),
    defineField({name: 'partner_cta_heading', title: 'CTA Heading', type: 'string'}),
    defineField({name: 'partner_cta_text', title: 'CTA Body', type: 'text', rows: 4}),
    defineField({name: 'partner_cta_button', title: 'CTA Button Text', type: 'string'}),
  ],
  preview: {
    prepare: () => ({title: 'Partners Page'}),
  },
})
