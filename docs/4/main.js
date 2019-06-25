

_renderer = undefined;
_mainScene = undefined;
_mainCamera = undefined;
_capScene = undefined;
_capScene2 = undefined;
_capTg = undefined;
_capTg2 = undefined;
_mesh = undefined;
_dest = undefined;
_dest2 = undefined;


// 初期設定
init();
function init() {

  var sw = $(window).width();
  var sh = window.innerHeight;

  // レンダラー
  _renderer = new THREE.WebGLRenderer({
    canvas : $('.mv').get(0),
    alpha : true,
    antialias : false,
    stencil : false,
    powerPreference : 'low-power'
  })
  _renderer.autoClear = true;

  // メインシーン
  _mainScene = new THREE.Scene();

  // メインカメラ
  _mainCamera = new THREE.PerspectiveCamera(80, 1, 0.1, 50000);

  // キャプチャシーン
  // まずここで色々動かす
  // ここで作った絵をメインシーンに渡す
  _capScene = new THREE.Scene();

  // ↑のレンダリング先
  _capTg = new THREE.WebGLRenderTarget(16, 16);


  _capScene2 = new THREE.Scene();

  // ↑のレンダリング先
  _capTg2 = new THREE.WebGLRenderTarget(16, 16);



  // 立方体
  _mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      color:0x967a2c
    })
  );
  _capScene.add(_mesh);

  // 描画部分
  _dest = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader:document.getElementById("vBasic").textContent,
      fragmentShader:document.getElementById("fBasic").textContent,
      transparent:true,
      depthTest:true,
      side:THREE.DoubleSide,
      uniforms:{
        tDiffuse:{value:_capTg.texture},
        time:{value:0}
      }
    })
  );
  _capScene2.add(_dest);

  _dest2 = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader:document.getElementById("vBasic").textContent,
      fragmentShader:document.getElementById("fBasic2").textContent,
      transparent:true,
      depthTest:true,
      side:THREE.DoubleSide,
      uniforms:{
        tDiffuse:{value:_capTg2.texture},
        resolution:{value:new THREE.Vector2()},
        time:{value:0}
      }
    })
  );
  _mainScene.add(_dest2);


  update();
}

// 毎フレーム実行
window.requestAnimationFrame(update);
function update() {

  var sw = $(window).width();
  var sh = window.innerHeight;

  // カメラ設定
  // ピクセル等倍になるように
  _mainCamera.aspect = sw / sh;
  _mainCamera.updateProjectionMatrix()
  _mainCamera.position.z = sh / Math.tan(_mainCamera.fov * Math.PI / 360) / 2;

  // レンダラーの設定
  _renderer.setClearColor(0xf2cdd1, 1); // 背景色
  _renderer.setPixelRatio(window.devicePixelRatio || 1);
  _renderer.setSize(sw, sh);

  // 立方体の設定
  var s = 0.3;
  _mesh.scale.set(sw * s, sw * s, sw * s);
  _mesh.rotation.x += 0.005;
  _mesh.rotation.y -= 0.006;
  _mesh.rotation.z += 0.011;
  _mesh.visible = false;

  // キャプチャ先テクスチャのサイズ
  _capTg.setSize(sw * window.devicePixelRatio, sh * window.devicePixelRatio);
  _capTg2.setSize(sw * window.devicePixelRatio, sh * window.devicePixelRatio);

  // メインシーンに渡してるテクスチャへキャプチャシーンをレンダリング
  _renderer.setRenderTarget(_capTg, true);
  _renderer.render(_capScene, _mainCamera, _capTg);

  _renderer.setRenderTarget(_capTg2, true);
  _renderer.render(_capScene2, _mainCamera, _capTg2);

  // シェーダーに渡す変数の更新
  _dest.material.uniforms.time.value += 0.2;
  _dest2.material.uniforms.time.value += 0.2;
  _dest2.material.uniforms.resolution.value.set(sw * window.devicePixelRatio, sh * window.devicePixelRatio);

  // 出力用メッシュを画面サイズに
  _dest.scale.set(sw, sh, 1);
  _dest2.scale.set(sw, sh, 1);

  // レンダリング
  _renderer.render(_mainScene, _mainCamera);

  window.requestAnimationFrame(update);
}
