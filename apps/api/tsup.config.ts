import {defineConfig} from 'tsup';
export default defineConfig({entry:['src/main.ts'],format:['esm'],target:'node22',noExternal:[/^@crunchrr\//],clean:true,sourcemap:true});
