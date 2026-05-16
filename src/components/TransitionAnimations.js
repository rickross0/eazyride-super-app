import { CardStyleInterpolators, TransitionPresets } from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';

export const slideFromRight = {
  ...TransitionPresets.SlideFromRightIOS,
};

export const fadeFromBottom = {
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: { duration: 400, easing: Easing.inOut(Easing.cubic) },
    },
    close: {
      animation: 'timing',
      config: { duration: 300, easing: Easing.in(Easing.cubic) },
    },
  },
};

export const modalPresentation = {
  ...TransitionPresets.ModalPresentationIOS,
  gestureEnabled: true,
  gestureDirection: 'vertical',
};
