// Called only after the host/source-window check in the existing map bridge.
export function createCampusRouteOverlay({THREE,scene,camera,controls,invalidate,padding}){
  let group=null;
  const clear=()=>{if(!group)return;scene.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});group=null;camera.clearViewOffset();invalidate();};
  return {clear,show(points){
    clear();
    if(!Array.isArray(points)||points.length<2||points.length>10000||!points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<5000)))return;
    group=new THREE.Group();group.name='companion-walking-route';
    const vectors=points.map(([x,y])=>new THREE.Vector3(x,1.8,-y));
    const curve=new THREE.CurvePath();for(let i=1;i<vectors.length;i++)curve.add(new THREE.LineCurve3(vectors[i-1],vectors[i]));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(points.length*3,30),1.6,5,false),new THREE.MeshBasicMaterial({color:0x16896c,depthTest:false,transparent:true,opacity:.95}));mesh.renderOrder=2000;group.add(mesh);
    for(const [index,color]of [[0,0x16896c],[vectors.length-1,0xd67a42]]){const marker=new THREE.Mesh(new THREE.SphereGeometry(5,12,8),new THREE.MeshBasicMaterial({color,depthTest:false}));marker.position.copy(vectors[index]);marker.renderOrder=2001;group.add(marker);}
    scene.add(group);
    const box=new THREE.Box3().setFromPoints(vectors),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
    const p=padding(),fit=Math.max(innerWidth/Math.max(180,innerWidth-p.left-p.right),innerHeight/Math.max(180,innerHeight-p.top-p.bottom));
    const range=Math.max(180,size.length()*1.2)*Math.max(1,Math.min(4,fit));
    controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(range*.3,range,range*.6));
    controls.update();invalidate();
  }};
}
