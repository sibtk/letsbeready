import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemas'
import {deskStructure} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: "Let's Be Ready",

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'juhmq0dg',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({structure: deskStructure}),
    media(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singletons from "create new document" menu
    templates: (templates) =>
      templates.filter(
        ({schemaType}) =>
          ![
            'siteSettings',
            'homepage',
            'nutritionPage',
            'curriculumPage',
            'donatePage',
            'partnersPage',
            'staffPage',
          ].includes(schemaType),
      ),
  },

  document: {
    // Hide delete/duplicate on singletons
    actions: (input, context) => {
      const singletons = [
        'siteSettings',
        'homepage',
        'nutritionPage',
        'curriculumPage',
        'donatePage',
        'partnersPage',
        'staffPage',
      ]
      if (singletons.includes(context.schemaType)) {
        return input.filter(
          ({action}) => action && !['delete', 'duplicate', 'unpublish'].includes(action),
        )
      }
      return input
    },
  },
})
