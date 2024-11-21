import mirinaeTailwind from '@cloudforet-test/mirinae/tailwind.config.cjs';

export default {
  purge: ['./src/**/*.{html,js,jsx,ts,tsx,vue}', './index.html'],

  theme: {
    flex: {
      1: '1 1 0%',
      2: '2 2 0%',
    },
    ...mirinaeTailwind.theme,
  },
  variants: [...mirinaeTailwind.variants],
  plugins: [...mirinaeTailwind.plugins],
};
