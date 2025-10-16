import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  extract: {enabled: false},
  tsconfig: 'tsconfig.build.json',
  runtime: 'browser',
  dts: 'rolldown',
})
