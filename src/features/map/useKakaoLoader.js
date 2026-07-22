import { useEffect, useState } from 'react';

// 카카오 지도 SDK 로더. autoload=false → 스크립트 로드 후 kakao.maps.load() 콜백에서 준비 신호.
const SRC =
  `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}` +
  `&libraries=services,clusterer,drawing&autoload=false`;

const SCRIPT_ID = 'kakao-maps-sdk';

export function useKakaoLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setReady(true));
      return;
    }
    let script = document.getElementById(SCRIPT_ID);
    const onLoad = () => window.kakao.maps.load(() => setReady(true));
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', onLoad);
    return () => script?.removeEventListener('load', onLoad);
  }, []);

  return ready;
}

export function getKakao() {
  return window.kakao;
}
