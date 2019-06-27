module.exports = {
  outputPath: 'dist/static',
  plugins: [
    ['epig-plugin-admin', { async: false }],
    ['epig-plugin-copy-server', { output: 'dist' }],
  ],
}