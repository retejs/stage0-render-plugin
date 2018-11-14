import sass from 'rollup-plugin-sass';

export default {
    input: 'src/index.js',
    name: 'Stage0RenderPlugin',
    globals: {
        'stage0/index': 'h',
        'stage0/reconcile': 'reconcile'
    },
    plugins: [
        sass({
            insert: true
        })
    ]
}