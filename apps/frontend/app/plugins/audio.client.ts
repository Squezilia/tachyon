import { Howl } from 'howler';

export default defineNuxtPlugin(() => {
  const sounds = {
    notificationInfo: new Howl({
      src: ['/info.mp3'],
      volume: 0.3,
      preload: true,
    }),
    notificationError: new Howl({
      src: ['/error.mp3'],
      volume: 0.4,
      preload: true,
    }),
    notificationSuccess: new Howl({
      src: ['/success.mp3'],
      volume: 0.2,
      preload: true,
    }),
  };

  return {
    provide: {
      sound: {
        play(name: 'info' | 'error' | 'success') {
          switch (name) {
            case 'info':
              sounds.notificationInfo.play();
              break;

            case 'error':
              sounds.notificationError.play();
              break;

            case 'success':
              sounds.notificationSuccess.play();
              break;
          }
        },
      },
    },
  };
});
