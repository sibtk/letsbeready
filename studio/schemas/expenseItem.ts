import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'expenseItem',
  title: 'Expense Item',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'percent',
      title: 'Percent (0-100)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: 'color',
      title: 'Color (hex, e.g. #146BF6)',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^#[0-9a-fA-F]{6}$/, {name: 'hex color'}),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {label: 'label', percent: 'percent', color: 'color'},
    prepare: ({label, percent, color}) => ({
      title: `${label} — ${percent}%`,
      subtitle: color,
    }),
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Percent (high to low)',
      name: 'percentDesc',
      by: [{field: 'percent', direction: 'desc'}],
    },
  ],
})
