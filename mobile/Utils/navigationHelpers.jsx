import { CommonActions } from '@react-navigation/native';

export const resetToTab = (tabName) => {
  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: 'MainStack',
        state: {
          routes: [
            {
              name: 'Tabs',
              state: {
                routes: [{ name: tabName }],
              },
            },
          ],
        },
      },
    ],
  });
};
