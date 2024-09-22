import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse HEAD').toString();

export default defineConfig({
    plugins: [sveltekit()],
    define: {
        __COMMIT_HASH__: JSON.stringify(commitHash)
    }
});
