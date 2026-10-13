import {defineConfig} from 'tsup';
export default defineConfig({entry:['src/index.ts'],format:['esm'],target:'node22',noExternal:[/^@crunchrr\//],clean:true,sourcemap:true});
