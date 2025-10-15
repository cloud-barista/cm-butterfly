module.exports = {
  plugins: [
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer'),
    require('postcss-nesting'),
    require('postcss-simple-vars')({
      variables: () => {
        return require('./src/app/style/variable.cjs');
      },
    }),
  ],
};
