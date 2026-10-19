var Yd={road:"M7 3 3 21M17 3l4 18M12 3v4M12 10v4M12 17v4",dining:"M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 3c-3 4-3 8 1 8h1M19 3v18",shop:"M4 9v12h16V9M3 9l2-6h14l2 6M3 9c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0M9 21v-7h6v7",bus:"M6 3h12a2 2 0 0 1 2 2v13H4V5a2 2 0 0 1 2-2ZM4 11h16M7 15h1M16 15h1M7 18v3M17 18v3",medical:"M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z",leaf:"M20 3C8 2 2 7 5 15c3 8 17 5 15-12ZM4 21 16 9",culture:"m3 8 9-5 9 5ZM5 10v9M10 10v9M14 10v9M19 10v9M3 21h18",gate:"M4 21V3h16v18M8 21V7h8v14M2 21h20",water:"M2 8q3-4 6 0t6 0 6 0M2 13q3-4 6 0t6 0 6 0M2 18q3-4 6 0t6 0 6 0",search:"M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",pin:"M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0",plus:"M12 5v14M5 12h14",minus:"M5 12h14",close:"m6 6 12 12M18 6 6 18",star:"m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z",share:"M15 3h6v6M21 3 10 14M11 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6",comment:"M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2.5-4a8.5 8.5 0 1 1 15.5-4.5ZM8 10h8M8 14h5",location:"M12 2v3M12 19v3M2 12h3M19 12h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",north:"m12 3 6 17-6-4-6 4Z",fullscreen:"M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5",layers:"m12 3 10 6-10 6L2 9ZM2 13l10 6 10-6M2 17l10 6 10-6",top:"M4 4h16v16H4ZM4 9h16M9 9v11",reset:"M3 10a9 9 0 1 1 1 7M3 4v6h6",hand:"M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v7c0 5-3 8-7 8-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2",rotate:"M4 9a8 8 0 0 1 14-4l3 3M21 3v5h-5M20 15a8 8 0 0 1-14 4l-3-3M3 21v-5h5",sun:"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",more:"M5 11v2M12 11v2M19 11v2",filter:"M4 7h16M4 17h16M8 4v6M16 14v6",building:"M4 21V3h12v18M16 9h4v12M8 7h4M8 11h4M8 15h4M2 21h20",arrow:"M5 12h14m-5-5 5 5-5 5"};function Ks(i){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.classList.add("ui-icon");for(let[n,s]of Object.entries({viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"}))e.setAttribute(n,s);let t=document.createElementNS(e.namespaceURI,"path");return t.setAttribute("d",Yd[i]||Yd.pin),e.append(t),e}function sn(i,e,t){if(i.replaceChildren(Ks(e)),t){let n=document.createElement("span");n.textContent=t,i.append(n)}return i}function $d(i=document){i.querySelectorAll("[data-ui-icon]").forEach(e=>{e.querySelector(".ui-icon")||e.prepend(Ks(e.dataset.uiIcon))})}function Zd({invalidate:i}){$d();let e=document.querySelector("#map-settings-dialog"),t=document.querySelector("#open-map-settings");t.addEventListener("click",()=>{e.showModal(),t.setAttribute("aria-expanded","true")}),document.querySelector("#close-map-settings").addEventListener("click",()=>e.close()),e.addEventListener("close",()=>{t.setAttribute("aria-expanded","false"),i()}),e.addEventListener("click",n=>{if(n.target===e){let s=e.getBoundingClientRect();(n.clientX<s.left||n.clientX>s.right||n.clientY<s.top||n.clientY>s.bottom)&&e.close()}}),document.querySelector("#open-reference-map").addEventListener("click",()=>e.close()),document.querySelector("#place-filters").addEventListener("toggle",i)}function au(){let i=document.querySelector("#stage");if(i.clientWidth>760&&i.clientHeight>500)return;document.querySelector("#building-search").blur(),document.querySelector(".explore").classList.remove("tools-expanded");let e=document.querySelector("#mobile-tools-toggle");e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label","\u5C55\u5F00\u7B5B\u9009"),e.title="\u5C55\u5F00\u7B5B\u9009"}var Ro={"102\u4E61\u9053":["102xiangdao","102xd"],"104\u4E61\u9053":["104xiangdao","104xd"],"1762s":["1762s","1762s"],"68\u70E7\u70E4\u58EB\u591A":["68shaokaoshiduo","68sksd"],"7-Eleven":["7-Eleven","7-Eleven"],"7\u4E2A\u5821\xB7\u7099\u70E4\u725B\u8089\u6C49\u5821\uFF08\u91D1\u9F0E\u5B81\u5802\u5E97\uFF09":["7gebao\xB7zhikaoniurouhanbao\uFF08jindingningtangdian\uFF09","7gb\xB7zknrhb\uFF08jdntd\uFF09"],"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668":["AED zidongtiwaichuchanqi","AED zdtwccq"],"Apple\u6388\u6743\u4E13\u8425\u5E97\uFF08\u950B\u4E3A\u73E0\u6D77\u9999\u6D32\u9AD8\u65B0\u5B9D\u9F99\u5E7F\u573A\u5E97\uFF09":["Appleshouquanzhuanyingdian\uFF08fengweizhuhaixiangzhougaoxinbaolongguangchangdian\uFF09","Applesqzyd\uFF08fwzhxzgxblgcd\uFF09"],CV\u81EA\u9009\u9910:["CVzixuancan","CVzxc"],"D1 \u96CD\u96C5\u82D1":["D1 yongyayuan","D1 yyy"],D2:["D2","D2"],"D3 \u4E50\u96C5\u82D1":["D3 leyayuan","D3 lyy"],D4:["D4","D4"],"D5 \u5B8F\u96C5\u82D1":["D5 hongyayuan","D5 hyy"],"D6 \u6B63\u96C5\u82D1":["D6 zhengyayuan","D6 zyy"],"MU \u745C\u4F3D\xB7\u666E\u62C9\u63D0":["MU yujia\xB7pulati","MU yj\xB7plt"],"Main Library":["Main Library","Main Library"],"T1 \u539A\u5FB7\u697C":["T1 houdelou","T1 hdl"],"T2 \u4EBA\u6587\u697C":["T2 renwenlou","T2 rwl"],"T29 \u6559\u5B66\u697C":["T29 jiaoxuelou","T29 jxl"],"T3 \u683C\u7269\u697C":["T3 gewulou","T3 gwl"],"T4 \u6559\u5B66\u697C":["T4 jiaoxuelou","T4 jxl"],"T5 \u6559\u5B66\u697C":["T5 jiaoxuelou","T5 jxl"],"T6 \u6559\u5B66\u697C":["T6 jiaoxuelou","T6 jxl"],"T7 \u6559\u5B66\u697C":["T7 jiaoxuelou","T7 jxl"],"T8 \u535A\u7B80\u697C":["T8 bojianlou","T8 bjl"],UGYM:["UGYM","UGYM"],"UIC \u4F11\u95F2\u5C0F\u6808":["UIC xiuxianxiaozhan","UIC xxxz"],"UIC \u9AD8\u7B49\u7814\u7A76\u9662":["UIC gaodengyanjiuyuan","UIC gdyjy"],"UIC\u5B66\u9662\uFF08\u6587\u521B\u697C\uFF09":["UICxueyuan\uFF08wenchuanglou\uFF09","UICxy\uFF08wcl\uFF09"],"V15 \u660E\u5FC3\u697C":["V15 mingxinlou","V15 mxl"],"V16 \u5C1A\u8D24\u697C":["V16 shangxianlou","V16 sxl"],"V17 \u4EC1\u7231\u697C":["V17 renailou","V17 ral"],"V18 \u62B1\u6734\u697C":["V18 baopulou","V18 bpl"],"V19 \u771F\u77E5\u697C":["V19 zhenzhilou","V19 zzl"],"V20 \u7B03\u884C\u697C":["V20 duxinglou","V20 dxl"],"V21 \u535A\u6587\u697C":["V21 bowenlou","V21 bwl"],"V22 \u96C5\u5FD7\u697C":["V22 yazhilou","V22 yzl"],"V23 \u96EA\u82B9\u697C":["V23 xueqinlou","V23 xql"],"V24 \u9633\u660E\u697C":["V24 yangminglou","V24 yml"],"V25 \u4E1C\u5761\u697C":["V25 dongpolou","V25 dpl"],"V26 \u6B4C\u5FB7\u697C":["V26 gedelou","V26 gdl"],"V27 \u96E8\u679C\u697C":["V27 yuguolou","V27 ygl"],"V28 \u838E\u7FC1\u697C":["V28 shawenglou","V28 swl"],"V29 \u5BB9\u95F3\u697C":["V29 ronghonglou","V29 rhl"],WOW\u51B0\u5BA4:["WOWbingshi","WOWbs"],Yo\u5065\u5EB7\u6599\u7406:["Yojiankangliaoli","Yojkll"],i\u679C\u9C9C\u5207:["iguoxianqie","igxq"],"mr. wu \u5364\u8089\u5377":["mr. wu luroujuan","mr. wu lrj"],\u4E00\u516D\u516B\u533B\u9662:["yiliubayiyuan","ylbyy"],\u4E00\u70B9\u70B9:["yidiandian","ydd"],\u4E07\u901A\u8D85\u5E02:["wantongchaoshi","wtcs"],\u4E09\u671F\u7403\u573A:["sanqiqiuchang","sqqc"],\u4E09\u6D25\u6C64\u5305:["sanjintangbao","sjtb"],\u4E0A\u6805:["shangshan","ss"],\u4E0B\u67F5:["xiashan","xs"],\u4E0B\u6805:["xiashan","xs"],\u4E0B\u6805\u793E\u533A:["xiashanshequ","xssq"],\u4E1C\u5317\u4EBA\u5BB6:["dongbeirenjia","dbrj"],\u4E1C\u5317\u5473\u9053\u70E7\u70E4\u5C4B:["dongbeiweidaoshaokaowu","dbwdskw"],\u4E1C\u5317\u963F\u9F99\u70E7\u70E4\u5427:["dongbeialongshaokaoba","dbalskb"],\u4E1C\u5927\u95E8:["dongdamen","ddm"],\u4E2D\u548C:["zhonghe","zh"],\u4E2D\u56FD\u519C\u4E1A\u94F6\u884C:["zhongguonongyeyinhang","zgnyyh"],"\u4E2D\u56FD\u519C\u4E1A\u94F6\u884C ATM":["zhongguonongyeyinhang ATM","zgnyyh ATM"],\u4E2D\u56FD\u7535\u4FE1:["zhongguodianxin","zgdx"],\u4E2D\u56FD\u77F3\u5316:["zhongguoshihua","zgsh"],\u4E2D\u56FD\u79FB\u52A8:["zhongguoyidong","zgyd"],\u4E2D\u56FD\u8054\u901A:["zhongguoliantong","zglt"],\u4E2D\u5FC3\u6E56:["zhongxinhu","zxh"],\u4E2D\u73E0\u6E20\u5357\u8DEF:["zhongzhuqunanlu","zzqnl"],\u4E2D\u76C8\u9910\u5385:["zhongyingcanting","zyct"],\u4E2D\u7F8E\u56FD\u9645\u5B66\u9662:["zhongmeiguojixueyuan","zmgjxy"],\u4E30\u5DE2:["fengchao","fc"],\u4E3D\u6CFD\u4E1C\u8DEF:["lizedonglu","lzdl"],\u4E3D\u6CFD\u5730\u4E0B\u505C\u8F66\u573A:["lizedixiatingchechang","lzdxtcc"],\u4E3D\u6CFD\u697C:["lizelou","lzl"],\u4E3D\u6CFD\u697CA\u680B:["lizelouAdong","lzlAd"],\u4E3D\u6CFD\u697CB\u680B:["lizelouBdong","lzlBd"],\u4E3D\u6CFD\u697CC\u680B:["lizelouCdong","lzlCd"],\u4E3D\u6CFD\u6E56:["lizehu","lzh"],\u4E50\u80B2\u697C:["leyulou","lyl"],\u4E61\u60C5\u9986:["xiangqingguan","xqg"],\u4E66\u4EA6\u70E7\u4ED9\u8349:["shuyishaoxiancao","sysxc"],\u4E66\u5C71\u8DEF:["shushanlu","ssl"],\u4E66\u97F5\u4E00\u8DEF:["shuyunyilu","syyl"],\u4E66\u97F5\u4E8C\u8DEF:["shuyunerlu","syel"],\u4E91\u5357\u7C73\u7EBF:["yunnanmixian","ynmx"],\u4E91\u6E58\u5473:["yunxiangwei","yxw"],\u4EAC\u534E\u82D11\u680B:["jinghuayuan1dong","jhy1d"],\u4EAC\u534E\u82D12\u680B:["jinghuayuan2dong","jhy2d"],\u4EAC\u534E\u82D13\u680B:["jinghuayuan3dong","jhy3d"],\u4EAC\u534E\u82D14\u680B:["jinghuayuan4dong","jhy4d"],\u4EAC\u534E\u82D15\u680B:["jinghuayuan5dong","jhy5d"],\u4EAC\u5E08\u5BB6\u56ED:["jingshijiayuan","jsjy"],\u4EAC\u5E08\u5BB6\u56ED11\u680B:["jingshijiayuan11dong","jsjy11d"],\u4EAC\u5E08\u5BB6\u56ED12\u680B:["jingshijiayuan12dong","jsjy12d"],\u4EAC\u5E08\u5BB6\u56ED13\u680B:["jingshijiayuan13dong","jsjy13d"],\u4EAC\u5E08\u5BB6\u56ED14\u680B:["jingshijiayuan14dong","jsjy14d"],\u4EAC\u5E08\u5BB6\u56ED15\u680B:["jingshijiayuan15dong","jsjy15d"],\u4EAC\u5E08\u5BB6\u56ED16\u680B:["jingshijiayuan16dong","jsjy16d"],\u4EAC\u5E08\u5BB6\u56ED17\u680B:["jingshijiayuan17dong","jsjy17d"],\u4EAC\u5E08\u5BB6\u56ED18\u680B:["jingshijiayuan18dong","jsjy18d"],\u4EAC\u5E08\u5BB6\u56ED19\u680B:["jingshijiayuan19dong","jsjy19d"],\u4EAC\u5E08\u5BB6\u56ED1\u680B:["jingshijiayuan1dong","jsjy1d"],\u4EAC\u5E08\u5BB6\u56ED20\u680B:["jingshijiayuan20dong","jsjy20d"],\u4EAC\u5E08\u5BB6\u56ED21\u680B:["jingshijiayuan21dong","jsjy21d"],\u4EAC\u5E08\u5BB6\u56ED22\u680B:["jingshijiayuan22dong","jsjy22d"],\u4EAC\u5E08\u5BB6\u56ED23\u680B:["jingshijiayuan23dong","jsjy23d"],\u4EAC\u5E08\u5BB6\u56ED24\u680B:["jingshijiayuan24dong","jsjy24d"],\u4EAC\u5E08\u5BB6\u56ED25\u680B:["jingshijiayuan25dong","jsjy25d"],\u4EAC\u5E08\u5BB6\u56ED2\u680B:["jingshijiayuan2dong","jsjy2d"],\u4EAC\u5E08\u5BB6\u56ED3\u680B:["jingshijiayuan3dong","jsjy3d"],\u4EAC\u5E08\u5BB6\u56ED4\u680B:["jingshijiayuan4dong","jsjy4d"],\u4EAC\u5E08\u5BB6\u56ED6\u680B:["jingshijiayuan6dong","jsjy6d"],\u4EAC\u5E08\u5BB6\u56ED7\u680B:["jingshijiayuan7dong","jsjy7d"],\u4EAC\u5E08\u5BB6\u56ED\u5165\u53E3:["jingshijiayuanrukou","jsjyrk"],\u4ECA\u96E8\u8F69:["jinyuxuan","jyx"],\u4F11\u606F\u5EA7\u6905:["xiuxizuoyi","xxzy"],\u4F11\u95F2\u8BBE\u65BD:["xiuxiansheshi","xxss"],"\u4F18\u521B\u7CBE\u9009 \u897F\u5F0F\u65E9\u70B9":["youchuangjingxuan xishizaodian","ycjx xszd"],\u4F18\u6CF0\u79D1\u6280:["youtaikeji","ytkj"],\u4F18\u7231\u9910\u5385:["youaicanting","yact"],\u4F18\u8863\u5E93:["youyiku","yyk"],"\u4F1A\u5357\u4E00\u8857\uFF08\u89C4\u5212\uFF09":["huinanyijie\uFF08guihua\uFF09","hnyj\uFF08gh\uFF09"],\u4F1A\u5357\u4E09\u8857:["huinansanjie","hnsj"],"\u4F1A\u5357\u4E8C\u8857\uFF08\u89C4\u5212\u540D\uFF09":["huinanerjie\uFF08guihuaming\uFF09","hnej\uFF08ghm\uFF09"],\u4F1A\u540C:["huitong","ht"],\u4F1A\u540C\u4E66\u9662:["huitongshuyuan","htsy"],\u4F1A\u540C\u4F53\u80B2\u516C\u56ED:["huitongtiyugongyuan","httygy"],\u4F1A\u540C\u5317\u8DEF:["huitongbeilu","htbl"],\u4F1A\u540C\u5317\u8DEF\u5317:["huitongbeilubei","htblb"],\u4F1A\u540C\u5317\u8DEF\u5357:["huitongbeilunan","htbln"],\u4F1A\u540C\u5357\u8DEF:["huitongnanlu","htnl"],\u4F1A\u540C\u5357\u8DEF\u4E2D:["huitongnanluzhong","htnlz"],\u4F1A\u540C\u5357\u8DEF\u5317:["huitongnanlubei","htnlb"],\u4F1A\u540C\u5357\u8DEF\u5357:["huitongnanlunan","htnln"],\u4F1A\u540C\u53E4\u6751:["huitonggucun","htgc"],\u4F1A\u540C\u591C\u5E02:["huitongyeshi","htys"],\u4F1A\u540C\u5C71\u6C34\u519C\u5E84:["huitongshanshuinongzhuang","htssnz"],\u4F1A\u540C\u67512\u53F7\u505C\u8F66\u573A:["huitongcun2haotingchechang","htc2htcc"],\u4F1A\u540C\u67513\u53F7\u505C\u8F66\u573A:["huitongcun3haotingchechang","htc3htcc"],\u4F1A\u540C\u793E\u533A\u515A\u7FA4\u670D\u52A1\u4E2D\u5FC3:["huitongshequdangqunfuwuzhongxin","htsqdqfwzx"],\u4F1A\u540C\u7F09\u537F\u4EAD:["huitongjiqingting","htjqt"],\u4F1A\u540C\u8015\u8BFB\u793E:["huitonggengdushe","htgds"],\u4F1A\u540C\u8DEF:["huitonglu","htl"],\u4F1A\u540C\u8DEF\u53E3:["huitonglukou","htlk"],\u4F1A\u540C\u98DF\u8857:["huitongshijie","htsj"],"\u4F1A\u540C\u9A7F\u7AD9;\u4F1A\u540C\u6E38\u5BA2\u670D\u52A1\u4E2D\u5FC3":["huitongyizhan;huitongyoukefuwuzhongxin","htyz;htykfwzx"],\u4F1A\u6B63\u8857:["huizhengjie","hzj"],\u4F1A\u8BA1\u4E0E\u91D1\u878D\u5B66\u9662:["kuaijiyujinrongxueyuan","kjyjrxy"],\u4F1A\u8D24\u90A8\u5E7F\u573A:["huixiancunguangchang","hxcgc"],\u4F1A\u8D24\u90A8\u5F85\u6838\u4F4E\u5C42\u8F6E\u5ED3:["huixiancundaihedicenglunkuo","hxcdhdclk"],\u4F34\u98FD:["banbao","bb"],\u4F53\u80B2\u4E2D\u5FC3:["tiyuzhongxin","tyzx"],\u4F53\u80B2\u516C\u56ED:["tiyugongyuan","tygy"],\u4F53\u80B2\u573A:["tiyuchang","tyc"],\u4F53\u80B2\u8DEF:["tiyulu","tyl"],\u4F53\u80B2\u9986:["tiyuguan","tyg"],\u4F5B\u5F84:["fojing","fj"],\u4FDD\u536B\u5BA4:["baoweishi","bws"],\u4FE1\u606F\u5B66\u9662:["xinxixueyuan","xxxy"],\u4FE1\u606F\u79D1\u6280\u4E0E\u670D\u52A1\u4E2D\u5FC3:["xinxikejiyufuwuzhongxin","xxkjyfwzx"],\u505C\u8F66\u573A:["tingchechang","tcc"],\u505C\u8F66\u573A\u5165\u53E3:["tingchechangrukou","tccrk"],\u513F\u7AE5\u535A\u7269\u9986:["ertongbowuguan","etbwg"],\u5143\u767D\u697C:["yuanbailou","ybl"],\u5145\u7535\u7AD9:["chongdianzhan","cdz"],\u516B\u722A\u9C7C\u5BFF\u53F8:["bazhuayushousi","bzyss"],\u516C\u4EA4\u4E34\u65F6\u7AD9:["gongjiaolinshizhan","gjlsz"],\u516C\u4EA4\u62DB\u547C\u7AD9:["gongjiaozhaohuzhan","gjzhz"],\u516C\u4EA4\u7AD9:["gongjiaozhan","gjz"],\u516C\u56ED:["gongyuan","gy"],\u5170\u5DDE\u62C9\u9762:["lanzhoulamian","lzlm"],\u5170\u5DDE\u725B\u8089\u9762:["lanzhouniuroumian","lznrm"],\u5171\u4E50\u4EAD:["gongleting","glt"],\u5173\u4E1C\u4EBA\u5BB6:["guandongrenjia","gdrj"],\u51E4\u51F0\u8DEF:["fenghuanglu","fhl"],\u51FA\u5165\u53E3:["churukou","crk"],\u51FA\u79DF\u8F66\u505C\u8F66\u7AD9:["chuzuchetingchezhan","czctcz"],\u5218\u798F\u8BB0:["liufuji","lfj"],\u521B\u5BA2\u4E2D\u5FC3:["chuangkezhongxin","ckzx"],\u521B\u65B0\u4E00\u8DEF\u5357:["chuangxinyilunan","cxyln"],\u521B\u65B0\u4E00\u8DEF\u53E3:["chuangxinyilukou","cxylk"],\u521B\u65B0\u53D1\u5C55\u5927\u53A6:["chuangxinfazhandasha","cxfzds"],\u521B\u667A\u8DEF:["chuangzhilu","czl"],\u521D\u9009:["chuxuan","cx"],\u52B1\u6559\u697C:["lijiaolou","ljl"],\u52B1\u8018\u505C\u8F66\u573A:["liyuntingchechang","lytcc"],\u52B1\u8018\u697C:["liyunlou","lyl"],\u52B1\u8018\u8857:["liyunjie","lyj"],\u52B1\u81F4\u516C\u53F8:["lizhigongsi","lzgs"],"\u5317\u4EAC\u5E08\u8303\u5927\u5B66(\u73E0\u6D77\u6821\u533A)":["beijingshifandaxue(zhuhaixiaoqu)","bjsfdx(zhxq)"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u4E50\u80B2\u4E66\u9662:["beijingshifandaxueleyushuyuan","bjsfdxlysy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u4F1A\u540C\u4E66\u9662:["beijingshifandaxuehuitongshuyuan","bjsfdxhtsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u56FD\u5BB6\u5B89\u5168\u4E0E\u5E94\u6025\u7BA1\u7406\u5B66\u9662:["beijingshifandaxueguojiaanquanyuyingjiguanlixueyuan","bjsfdxgjaqyyjglxy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u5F18\u6587\u4E66\u9662:["beijingshifandaxuehongwenshuyuan","bjsfdxhwsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u672A\u6765\u8BBE\u8BA1\u5B66\u9662:["beijingshifandaxueweilaishejixueyuan","bjsfdxwlsjxy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u5206\u6821\u9644\u5C5E\u5916\u56FD\u8BED\u5B66\u6821:["beijingshifandaxuezhuhaifenxiaofushuwaiguoyuxuexiao","bjsfdxzhfxfswgyxx"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u5B9E\u9A8C\u5E7C\u513F\u56ED:["beijingshifandaxuezhuhaishiyanyoueryuan","bjsfdxzhsyyey"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u6821\u533A\u6E38\u6CF3\u9986:["beijingshifandaxuezhuhaixiaoquyouyongguan","bjsfdxzhxqyyg"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u77E5\u884C\u4E66\u9662:["beijingshifandaxuezhixingshuyuan","bjsfdxzxsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u783A\u884C\u4E66\u9662:["beijingshifandaxuelixingshuyuan","bjsfdxlxsy"],"\u5317\u4EAC\u7406\u5DE5\u5927\u5B66(\u73E0\u6D77)":["beijingligongdaxue(zhuhai)","bjlgdx(zh)"],\u5317\u4EAC\u7406\u5DE5\u5927\u5B66\u5927\u6E7E\u533A\u521B\u65B0\u7814\u7A76\u9662:["beijingligongdaxuedawanquchuangxinyanjiuyuan","bjlgdxdwqcxyjy"],"\u5317\u4EAC\u7406\u5DE5\u5927\u5B66\u9644\u5C5E\u5B9E\u9A8C\u5B66\u6821(\u73E0\u6D77)":["beijingligongdaxuefushushiyanxuexiao(zhuhai)","bjlgdxfssyxx(zh)"],\u5317\u5E08\u5927\u9644\u4E2D\u8DEF:["beishidafuzhonglu","bsdfzl"],\u5317\u5E08\u5927\u9AD8\u5C14\u592B\u7403\u573A:["beishidagaoerfuqiuchang","bsdgefqc"],\u5317\u5E08\u7F51\u7403\u573A:["beishiwangqiuchang","bswqc"],\u5317\u5E08\u9999\u6E2F\u6D78\u4F1A\u5927\u5B66:["beishixianggangjinhuidaxue","bsxgjhdx"],\u5317\u65B9\u624B\u5DE5\u6C34\u997A:["beifangshougongshuijiao","bfsgsj"],\u5317\u7406\u5DE5:["beiligong","blg"],"\u5317\u7406\u73E0 \u7FBD\u4E52\u7403\u9986":["beilizhu yupingqiuguan","blz ypqg"],\u5317\u7406\u73E0\u56FE\u4E66\u9986:["beilizhutushuguan","blztsg"],\u5317\u7406\u73E0\u6E05\u771F\u98DF\u5802:["beilizhuqingzhenshitang","blzqzst"],\u5317\u7406\u73E0\u7B2C\u4E00\u98DF\u5802:["beilizhudiyishitang","blzdyst"],\u5317\u7406\u73E0\u7B2C\u4E09\u98DF\u5802:["beilizhudisanshitang","blzdsst"],\u5317\u7406\u73E0\u7B2C\u4E8C\u98DF\u5802:["beilizhudiershitang","blzdest"],\u5317\u7406\u73E0\u7B2C\u56DB\u98DF\u5802:["beilizhudisishitang","blzdsst"],\u5317\u7406\u73E0\u946B\u8302\u9910\u5385:["beilizhuxinmaocanting","blzxmct"],\u533B\u52A1\u5BA4:["yiwushi","yws"],\u533B\u7597:["yiliao","yl"],\u533B\u7597\u53CA\u5065\u5EB7\u6559\u80B2\u4E2D\u5FC3:["yiliaojijiankangjiaoyuzhongxin","yljjkjyzx"],\u534E\u51A0\u5DE5\u4E1A\u56ED:["huaguangongyeyuan","hggyy"],\u534E\u51A0\u8DEF:["huaguanlu","hgl"],\u53571\u95E8:["nan1men","n1m"],\u53572\u95E8:["nan2men","n2m"],\u53573\u95E8:["nan3men","n3m"],\u53574\u95E8:["nan4men","n4m"],\u53575\u95E8:["nan5men","n5m"],\u5357\u5C71:["nanshan","ns"],\u5357\u66E6\u56ED:["nanxiyuan","nxy"],\u5364\u5473\u719F\u98DF:["luweishushi","lwss"],\u539F\u5473\u732A\u6742\u6C64\u996D:["yuanweizhuzatangfan","ywzztf"],\u53CC\u9F99:["shuanglong","sl"],\u53CC\u9F99\u6751\u53E3:["shuanglongcunkou","slck"],\u53D1\u8FBE\u732B:["fadamao","fdm"],\u53E4\u5143\u5927\u5B97\u7960:["guyuandazongci","gydzc"],\u53E4\u5143\u6545\u5C45:["guyuanguju","gygj"],\u53E4\u5143\u6587\u5316\u5E7F\u573A:["guyuanwenhuaguangchang","gywhgc"],"\u53E4\u6625\u5802 \u51C9\u8336\u7CD6\u6C34\u94FA":["guchuntang liangchatangshuipu","gct lctsp"],\u53E4\u6751\u519C\u5E84:["gucunnongzhuang","gcnz"],\u53E4\u6C0F\u5927\u5B97\u7960:["gushidazongci","gsdzc"],\u53E4\u97F5\u8DEF:["guyunlu","gyl"],\u53FB\u9CA8\u671D:["leshachao","lsc"],"\u5409\u7965 \u9EBB\u8FA3\u70EB":["jixiang malatang","jx mlt"],\u540C\u5FC3\u6CE5\u70E9\u9E21:["tongxinnihuiji","txnhj"],\u540D\u56FE\u79D1\u6280:["mingtukeji","mtkj"],\u5434\u6E05\u8F89\u4F09\u4FEA\u6F14\u827A\u5385:["wuqinghuikangliyanyiting","wqhklyyt"],\u543E\u5BB6\u5192\u83DC\u9986:["wujiamaocaiguan","wjmcg"],\u5473\u65CB\u5F8B:["weixuanl\xFC","wxl"],"\u5473\u6B63\u9999 \u81EA\u9009\u5957\u9910":["weizhengxiang zixuantaocan","wzx zxtc"],\u548C\u97F5\u4E00\u8DEF:["heyunyilu","hyyl"],\u548C\u97F5\u4E8C\u8DEF:["heyunerlu","hyel"],\u548C\u98CE\u62C9\u9762:["hefenglamian","hflm"],\u5510\u5BB6\u6E7E:["tangjiawan","tjw"],\u5510\u5BB6\u6E7E\u9547:["tangjiawanzhen","tjwz"],\u5546\u5B66\u9662:["shangxueyuan","sxy"],\u559C\u8BB0\u4E91\u997A:["xijiyunjiao","xjyj"],\u56ED\u533A\u670D\u52A1\u4E2D\u5FC3:["yuanqufuwuzhongxin","yqfwzx"],\u56FD\u5174\u4FBF\u5229\u5E97:["guoxingbianlidian","gxbld"],\u56FD\u9645\u4EA4\u6D41\u4E2D\u5FC3:["guojijiaoliuzhongxin","gjjlzx"],\u56FD\u9645\u53D1\u5C55\u5904:["guojifazhanchu","gjfzc"],\u5783\u573E\u4E2D\u8F6C\u7AD9:["lajizhongzhuanzhan","ljzzz"],\u5783\u573E\u56DE\u6536\u70B9:["lajihuishoudian","ljhsd"],\u5783\u573E\u6876:["lajitong","ljt"],\u57CE\u8F68\u5510\u5BB6\u6E7E\u7AD9:["chengguitangjiawanzhan","cgtjwz"],\u5854\u65AF\u6C40\u4E2D\u56FD\u6C49\u5821:["tasitingzhongguohanbao","tstzghb"],\u58F9\u53F7:["yihao","yh"],\u5916\u56FD\u8BED\u5B66\u9662:["waiguoyuxueyuan","wgyxy"],\u591A\u8BB0\u751C\u54C1:["duojitianpin","djtp"],"\u5927\u4F17\u81EA\u9009 \u4E2D\u5F0F\u65E9\u9910":["dazhongzixuan zhongshizaocan","dzzx zszc"],\u5927\u540C:["datong","dt"],\u5927\u5B66\u4F1A\u5802:["daxuehuitang","dxht"],\u5927\u667A\u8DEF:["dazhilu","dzl"],\u5927\u6E7E\u533A\u521B\u65B0\u7814\u7A76\u9662:["dawanquchuangxinyanjiuyuan","dwqcxyjy"],\u5927\u7403\u573A:["daqiuchang","dqc"],\u5927\u78A7\u6C60:["dabichi","dbc"],\u5929\u4F51\u697C:["tianyoulou","tyl"],"\u5929\u5929\u6C34\u679C \u6C34\u679C\u635E":["tiantianshuiguo shuiguolao","ttsg sgl"],\u5931\u7269\u62DB\u9886:["shiwuzhaoling","swzl"],\u5931\u7269\u62DB\u9886\u5904:["shiwuzhaolingchu","swzlc"],\u597D\u9999\u8DA3\u5C0F\u5403:["haoxiangquxiaochi","hxqxc"],\u5982\u610F\u9910\u5385:["ruyicanting","ryct"],\u5983\u5B50\u7B11:["feizixiao","fzx"],\u5B66\u4E00\u98DF\u5802:["xueyishitang","xyst"],\u5B66\u4E09\u98DF\u5802:["xuesanshitang","xsst"],\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3:["xuexiziyuanzhongxin","xxzyzx"],\u5B66\u4E8C\u98DF\u5802:["xueershitang","xest"],\u5B66\u751F\u4E8B\u52A1\u5904:["xueshengshiwuchu","xsswc"],\u5B66\u751F\u5BBF\u820D10\u680B:["xueshengsushe10dong","xsss10d"],\u5B66\u751F\u5BBF\u820D11\u680B:["xueshengsushe11dong","xsss11d"],\u5B66\u751F\u5BBF\u820D12\u680B:["xueshengsushe12dong","xsss12d"],\u5B66\u751F\u5BBF\u820D13\u680B:["xueshengsushe13dong","xsss13d"],\u5B66\u751F\u5BBF\u820D14\u680B:["xueshengsushe14dong","xsss14d"],\u5B66\u751F\u5BBF\u820D15\u680B:["xueshengsushe15dong","xsss15d"],\u5B66\u751F\u5BBF\u820D16\u680B:["xueshengsushe16dong","xsss16d"],\u5B66\u751F\u5BBF\u820D17\u680B:["xueshengsushe17dong","xsss17d"],\u5B66\u751F\u5BBF\u820D18\u680B:["xueshengsushe18dong","xsss18d"],\u5B66\u751F\u5BBF\u820D19\u680B:["xueshengsushe19dong","xsss19d"],\u5B66\u751F\u5BBF\u820D1\u680B:["xueshengsushe1dong","xsss1d"],\u5B66\u751F\u5BBF\u820D20\u680B:["xueshengsushe20dong","xsss20d"],\u5B66\u751F\u5BBF\u820D21\u680B:["xueshengsushe21dong","xsss21d"],\u5B66\u751F\u5BBF\u820D24\u680B:["xueshengsushe24dong","xsss24d"],\u5B66\u751F\u5BBF\u820D25\u680B:["xueshengsushe25dong","xsss25d"],\u5B66\u751F\u5BBF\u820D26\u680B:["xueshengsushe26dong","xsss26d"],\u5B66\u751F\u5BBF\u820D27\u680B:["xueshengsushe27dong","xsss27d"],\u5B66\u751F\u5BBF\u820D28\u680B:["xueshengsushe28dong","xsss28d"],\u5B66\u751F\u5BBF\u820D29\u680B:["xueshengsushe29dong","xsss29d"],\u5B66\u751F\u5BBF\u820D2\u680B:["xueshengsushe2dong","xsss2d"],\u5B66\u751F\u5BBF\u820D30\u680B:["xueshengsushe30dong","xsss30d"],\u5B66\u751F\u5BBF\u820D31\u680B:["xueshengsushe31dong","xsss31d"],\u5B66\u751F\u5BBF\u820D32\u680B:["xueshengsushe32dong","xsss32d"],\u5B66\u751F\u5BBF\u820D33\u680B:["xueshengsushe33dong","xsss33d"],\u5B66\u751F\u5BBF\u820D34\u680B:["xueshengsushe34dong","xsss34d"],\u5B66\u751F\u5BBF\u820D35\u680B:["xueshengsushe35dong","xsss35d"],\u5B66\u751F\u5BBF\u820D36\u680B:["xueshengsushe36dong","xsss36d"],\u5B66\u751F\u5BBF\u820D37\u680B:["xueshengsushe37dong","xsss37d"],\u5B66\u751F\u5BBF\u820D38\u680B:["xueshengsushe38dong","xsss38d"],\u5B66\u751F\u5BBF\u820D39\u680B:["xueshengsushe39dong","xsss39d"],\u5B66\u751F\u5BBF\u820D3\u680B:["xueshengsushe3dong","xsss3d"],\u5B66\u751F\u5BBF\u820D40\u680B:["xueshengsushe40dong","xsss40d"],\u5B66\u751F\u5BBF\u820D41\u680B:["xueshengsushe41dong","xsss41d"],\u5B66\u751F\u5BBF\u820D4\u680B:["xueshengsushe4dong","xsss4d"],\u5B66\u751F\u5BBF\u820D5\u680B:["xueshengsushe5dong","xsss5d"],\u5B66\u751F\u5BBF\u820D6\u680B:["xueshengsushe6dong","xsss6d"],\u5B66\u751F\u5BBF\u820D7\u680B:["xueshengsushe7dong","xsss7d"],\u5B66\u751F\u5BBF\u820D8\u680B:["xueshengsushe8dong","xsss8d"],\u5B66\u751F\u5BBF\u820D9\u680B:["xueshengsushe9dong","xsss9d"],\u5B81\u5802:["ningtang","nt"],\u5B81\u5802\u6751:["ningtangcun","ntc"],\u5B81\u5802\u793E\u533A\u6587\u5316\u6D3B\u52A8\u4E2D\u5FC3:["ningtangshequwenhuahuodongzhongxin","ntsqwhhdzx"],\u5B81\u5802\u793E\u533A\u6D88\u9632\u5BA3\u4F20\u4E3B\u9898\u516C\u56ED:["ningtangshequxiaofangxuanchuanzhutigongyuan","ntsqxfxcztgy"],\u5B8F\u5229\u836F\u4E1A:["hongliyaoye","hlyy"],\u5B98\u5858:["guantang","gt"],\u5B98\u5858\u4E09\u6751:["guantangsancun","gtsc"],\u5B98\u5858\u5357:["guantangnan","gtn"],\u5B98\u6751:["guancun","gc"],\u5B9D\u83B1\u7279\u79D1\u6280:["baolaitekeji","bltkj"],\u5C0F\u6768\u54E5\u732A\u811A\u996D:["xiaoyanggezhujiaofan","xygzjf"],\u5C0F\u7403\u573A:["xiaoqiuchang","xqc"],\u5C0F\u7BEE\u7403\u573A:["xiaolanqiuchang","xlqc"],\u5C0F\u8857\u80E1\u540C\u725B\u6742\u9762:["xiaojiehutongniuzamian","xjhtnzm"],"\u5C0F\u9547\u73AF\u8DEF\uFF08\u89C4\u5212\uFF09":["xiaozhenhuanlu\uFF08guihua\uFF09","xzhl\uFF08gh\uFF09"],\u5C1D\u7EFF:["changl\xFC","cl"],"\u5C71\u91CE\u95F4\xB7\u4F1A\u540C\u8425\u5730":["shanyejian\xB7huitongyingdi","syj\xB7htyd"],"\u5C7F\u53EF Yekoo":["yuke Yekoo","yk Yekoo"],\u5C7F\u53F8:["yusi","ys"],\u5DE5\u4E1A\u81EA\u52A8\u5316\u5B66\u9662:["gongyezidonghuaxueyuan","gyzdhxy"],\u5E03\u83B1\u6069\u7279\u9879\u76EE:["bulaientexiangmu","bletxm"],\u5E08\u751F\u6D3B\u52A8\u4E2D\u5FC3:["shishenghuodongzhongxin","sshdzx"],"\u5E38\u6765\xB7\u6E2F\u8BB0\u51B0\u5BA4":["changlai\xB7gangjibingshi","cl\xB7gjbs"],\u5E78\u8FD0\u9762\u5305:["xingyunmianbao","xymb"],\u5E7F\u5F0F\u62C9\u80A0:["guangshilachang","gslc"],\u5E7F\u5F0F\u70E7\u814A:["guangshishaola","gssl"],\u5E7F\u6FB3\u9AD8\u901F:["guangaogaosu","gags"],\u5E93\u8FEA\u5496\u5561:["kudikafei","kdkf"],\u5EB7\u987A\u7EFF\u9053:["kangshunl\xFCdao","ksld"],\u5F04\u6F6E:["nongchao","nc"],\u5F18\u6587\u697C:["hongwenlou","hwl"],\u5F18\u6BC5\u697C:["hongyilou","hyl"],\u5F97\u4E00\u4FBF\u5229:["deyibianli","dybl"],\u5F97\u4E00\u7172\u4ED4\u996D:["deyibaozaifan","dybzf"],\u5F97\u4F73\u7535\u5668:["dejiadianqi","djdq"],\u5FB7\u8C6A\u6DA6\u8FBE:["dehaorunda","dhrd"],\u5FC3\u6F6E:["xinchao","xc"],\u5FC5\u80DC\u5BA2:["bishengke","bsk"],\u5FD7\u5C11\u4FA0\u94C1\u677F\u996D:["zhishaoxiatiebanfan","zsxtbf"],\u6021\u8D2D\u8D85\u5E02:["yigouchaoshi","ygcs"],"\u60A0\u7136Crazy\u8FDE\u9501\u516C\u5BD3\uFF08\u5510\u5BB6\u6E7E\u8F7B\u8F68\u7AD9\u5E97\uFF09":["youranCrazyliansuogongyu\uFF08tangjiawanqingguizhandian\uFF09","yrCrazylsgy\uFF08tjwqgzd\uFF09"],"\u60A6\u8F7B\u8377 \u8F7B\u98DF":["yueqinghe qingshi","yqh qs"],\u6234\u7EF4\u65AF:["daiweisi","dws"],\u623F\u8BB0\u4E91\u5988\u7F50\u7F50\u7C73\u7EBF:["fangjiyunmaguanguanmixian","fjymggmx"],\u62AB\u8428\u4E4B\u795E:["pisazhishen","pszs"],"\u62CC\u58F9\u6876 \u5E72\u62CC\u5192\u83DC":["banyitong ganbanmaocai","byt gbmc"],\u62D3\u5C55\u8BAD\u7EC3\u573A:["tuozhanxunlianchang","tzxlc"],"\u62DB\u5546\u94F6\u884C ATM":["zhaoshangyinhang ATM","zsyh ATM"],\u62F1\u661F\u4E09\u5DF7\u53E3:["gongxingsanxiangkou","gxsxk"],\u62FE\u5149\u4E66\u5C4B:["shiguangshuwu","sgsw"],\u62FE\u5149\u6587\u521B\u9986:["shiguangwenchuangguan","sgwcg"],"\u62FE\u5706\xB7\u6392\u9AA8\u6382":["shiyuan\xB7paigudian","sy\xB7pgd"],\u6559\u52A1\u5904:["jiaowuchu","jwc"],\u6559\u5E08\u516C\u5BD3T1:["jiaoshigongyuT1","jsgyT1"],\u6559\u5E08\u516C\u5BD3T2:["jiaoshigongyuT2","jsgyT2"],\u6559\u5E08\u516C\u5BD3T3:["jiaoshigongyuT3","jsgyT3"],\u6559\u5E08\u516C\u5BD3T4:["jiaoshigongyuT4","jsgyT4"],\u6559\u5E08\u516C\u5BD3T5:["jiaoshigongyuT5","jsgyT5"],\u6559\u5E08\u516C\u5BD3T6:["jiaoshigongyuT6","jsgyT6"],\u6559\u5E08\u516C\u5BD3T7:["jiaoshigongyuT7","jsgyT7"],\u6559\u5E08\u516C\u5BD3T8:["jiaoshigongyuT8","jsgyT8"],\u6559\u5E08\u516C\u5BD3T9:["jiaoshigongyuT9","jsgyT9"],\u6559\u5E08\u516C\u5BD3\u4E8C\u671F:["jiaoshigongyuerqi","jsgyeq"],\u6570\u7406\u4E0E\u571F\u6728\u5DE5\u7A0B\u5B66\u9662:["shuliyutumugongchengxueyuan","slytmgcxy"],\u6587\u4F53\u4E2D\u5FC3:["wentizhongxin","wtzx"],\u6587\u5316\u521B\u610F\u7FA4\u843D:["wenhuachuangyiqunluo","whcyql"],\u6587\u534E\u82D1:["wenhuayuan","why"],\u6587\u534E\u82D11\u680B:["wenhuayuan1dong","why1d"],\u6587\u534E\u82D12\u680B:["wenhuayuan2dong","why2d"],\u6587\u534E\u82D13\u680B:["wenhuayuan3dong","why3d"],\u6587\u534E\u82D14\u680B:["wenhuayuan4dong","why4d"],\u6587\u534E\u82D15\u680B:["wenhuayuan5dong","why5d"],\u6587\u534E\u82D16\u680B:["wenhuayuan6dong","why6d"],\u6587\u534E\u82D18\u680B:["wenhuayuan8dong","why8d"],"\u6587\u534E\u82D1\u56FE\u4E66\u9986/\u6587\u534E\u82D17\u680B":["wenhuayuantushuguan/wenhuayuan7dong","whytsg/why7d"],\u6587\u534E\u82D1\u9910\u5385:["wenhuayuancanting","whyct"],"\u65B0\u4E1C\u767E\u8D27\uFF08\u5B81\u5802\u5206\u5E97\uFF09":["xindongbaihuo\uFF08ningtangfendian\uFF09","xdbh\uFF08ntfd\uFF09"],\u65B0\u56F4:["xinwei","xw"],\u65B0\u56F4\u6751:["xinweicun","xwc"],\u65B0\u56F4\u6751\u53E3:["xinweicunkou","xwck"],\u65B0\u5D34\u516C\u9986:["xinwaigongguan","xwgg"],\u65B0\u6751:["xincun","xc"],\u65B0\u6751\u53E3:["xincunkou","xck"],\u65B0\u96C5\u8DEF:["xinyalu","xyl"],\u65F6\u5149\u852C\u679C:["shiguangshuguo","sgsg"],\u660E\u5FB7\u697C:["mingdelou","mdl"],\u660E\u5FB7\u6E56:["mingdehu","mdh"],\u660E\u6D1E\u62CC\u996D:["mingdongbanfan","mdbf"],\u661F\u4ED4\u5C71\u516C\u56ED:["xingzaishangongyuan","xzsgy"],\u661F\u5DF4\u514B:["xingbake","xbk"],\u661F\u661F\u4FBF\u5229\u5E97:["xingxingbianlidian","xxbld"],\u661F\u671F\u516B:["xingqiba","xqb"],\u661F\u706B\u95E8:["xinghuomen","xhm"],\u6625\u6656\u56ED:["chunhuiyuan","chy"],\u666E\u751F\u533B\u7597\u79D1\u6280:["pushengyiliaokeji","psylkj"],\u666F\u5CF0\u5E7F\u573A:["jingfengguangchang","jfgc"],\u667A\u660E\u8DEF:["zhiminglu","zml"],\u667A\u8BDA\u8DEF:["zhichenglu","zcl"],\u66E6\u56ED:["xiyuan","xy"],\u6708\u4EAE\u6E56:["yuelianghu","ylh"],\u6728\u94CE\u697C:["muduolou","mdl"],"\u672A\u547D\u540D\u5EFA\u7B51 1191618603":["weimingmingjianzhu 1191618603","wmmjz 1191618603"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625876":["weimingmingjianzhu 1201625876","wmmjz 1201625876"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625882":["weimingmingjianzhu 1201625882","wmmjz 1201625882"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625883":["weimingmingjianzhu 1201625883","wmmjz 1201625883"],"\u672A\u547D\u540D\u5EFA\u7B51 1202303549":["weimingmingjianzhu 1202303549","wmmjz 1202303549"],"\u672A\u547D\u540D\u5EFA\u7B51 1206553328":["weimingmingjianzhu 1206553328","wmmjz 1206553328"],"\u672A\u547D\u540D\u5EFA\u7B51 1206553329":["weimingmingjianzhu 1206553329","wmmjz 1206553329"],"\u672A\u547D\u540D\u5EFA\u7B51 1209647875":["weimingmingjianzhu 1209647875","wmmjz 1209647875"],"\u672A\u547D\u540D\u5EFA\u7B51 1215697328":["weimingmingjianzhu 1215697328","wmmjz 1215697328"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048510":["weimingmingjianzhu 1384048510","wmmjz 1384048510"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048511":["weimingmingjianzhu 1384048511","wmmjz 1384048511"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048512":["weimingmingjianzhu 1384048512","wmmjz 1384048512"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048513":["weimingmingjianzhu 1384048513","wmmjz 1384048513"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048514":["weimingmingjianzhu 1384048514","wmmjz 1384048514"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101157":["weimingmingjianzhu 1384101157","wmmjz 1384101157"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101158":["weimingmingjianzhu 1384101158","wmmjz 1384101158"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101159":["weimingmingjianzhu 1384101159","wmmjz 1384101159"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101160":["weimingmingjianzhu 1384101160","wmmjz 1384101160"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101161":["weimingmingjianzhu 1384101161","wmmjz 1384101161"],"\u672A\u547D\u540D\u5EFA\u7B51 1388933765":["weimingmingjianzhu 1388933765","wmmjz 1388933765"],"\u672A\u547D\u540D\u5EFA\u7B51 1434554451":["weimingmingjianzhu 1434554451","wmmjz 1434554451"],"\u672A\u547D\u540D\u5EFA\u7B51 1434554454":["weimingmingjianzhu 1434554454","wmmjz 1434554454"],"\u672A\u547D\u540D\u5EFA\u7B51 1446422779":["weimingmingjianzhu 1446422779","wmmjz 1446422779"],"\u672A\u547D\u540D\u5EFA\u7B51 1446422780":["weimingmingjianzhu 1446422780","wmmjz 1446422780"],"\u672A\u547D\u540D\u5EFA\u7B51 1459082762":["weimingmingjianzhu 1459082762","wmmjz 1459082762"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105120":["weimingmingjianzhu 1459105120","wmmjz 1459105120"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105121":["weimingmingjianzhu 1459105121","wmmjz 1459105121"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105140":["weimingmingjianzhu 1459105140","wmmjz 1459105140"],"\u672A\u547D\u540D\u5EFA\u7B51 18706867":["weimingmingjianzhu 18706867","wmmjz 18706867"],"\u672A\u547D\u540D\u5EFA\u7B51 19666480":["weimingmingjianzhu 19666480","wmmjz 19666480"],"\u672A\u547D\u540D\u5EFA\u7B51 19971851":["weimingmingjianzhu 19971851","wmmjz 19971851"],"\u672A\u547D\u540D\u5EFA\u7B51 19971852":["weimingmingjianzhu 19971852","wmmjz 19971852"],"\u672A\u547D\u540D\u5EFA\u7B51 664093255":["weimingmingjianzhu 664093255","wmmjz 664093255"],"\u672A\u547D\u540D\u5EFA\u7B51 664093282":["weimingmingjianzhu 664093282","wmmjz 664093282"],"\u672A\u547D\u540D\u5EFA\u7B51 664093284":["weimingmingjianzhu 664093284","wmmjz 664093284"],\u674E\u601D\u751C\u6C34\u679C\u635E:["lisitianshuiguolao","lstsgl"],\u6750\u6599\u4E0E\u73AF\u5883\u5B66\u9662:["cailiaoyuhuanjingxueyuan","clyhjxy"],\u6765\u5BA2\u8D85\u5E02:["laikechaoshi","lkcs"],\u679C\u9017\u8336:["guodoucha","gdc"],\u67CF\u53F6\u6797:["baiyelin","byl"],\u67CF\u53F6\u6797\u4E1C:["baiyelindong","byld"],\u67CF\u53F6\u6797\u6751\u8001\u4EBA\u4E2D\u5FC3:["baiyelincunlaorenzhongxin","bylclrzx"],\u67CF\u6797\u8DEF:["bolinlu","bll"],\u67F3\u5DDE\u87BA\u86F3\u7C89:["liuzhouluosifen","lzlsf"],\u6811\u6797:["shulin","sl"],\u6816\u971E\u4ED9\u9986:["qixiaxianguan","qxxg"],\u6821\u53F2\u9986:["xiaoshiguan","xsg"],\u6821\u540D\u77F3:["xiaomingshi","xms"],\u6821\u56ED\u56FE\u6587:["xiaoyuantuwen","xytw"],\u6821\u56ED\u5C0F\u6E7F\u5730:["xiaoyuanxiaoshidi","xyxsd"],\u683C\u529B\u5B66\u9662:["gelixueyuan","glxy"],\u6842\u6E90\u7965:["guiyuanxiang","gyx"],\u6986\u6808:["yuzhan","yz"],\u6A2A\u5E97\u5F71\u57CE:["hengdianyingcheng","hdyc"],\u6A80\u9999\u5C71\u5496\u5561:["tanxiangshankafei","txskf"],\u6B63\u5751:["zhengkeng","zk"],\u6B63\u5751\u6C34\u5E93\u8DEF\u53E3:["zhengkengshuikulukou","zksklk"],\u6C11\u5546\u6CD5\u5F8B\u5B66\u9662:["minshangfal\xFCxueyuan","msflxy"],"\u6C34\u6676\u4E4B\u604B\uFF08\u5B81\u5802\u9547\u5E97\uFF09":["shuijingzhilian\uFF08ningtangzhendian\uFF09","sjzl\uFF08ntzd\uFF09"],\u6C38\u4E30\u8DEF\u53E3:["yongfenglukou","yflk"],\u6C42\u662F\u697C:["qiushilou","qsl"],"\u6C47\u7EB3\u4E2D\u8DEF\uFF08\u89C4\u5212\uFF09":["huinazhonglu\uFF08guihua\uFF09","hnzl\uFF08gh\uFF09"],\u6C55\u5934\u7CBF\u6761\u6C64:["shantouguotiaotang","stgtt"],\u6C64\u59C6\u7EA6\u514B:["tangmuyueke","tmyk"],\u6C64\u7C89\u4E16\u5BB6:["tangfenshijia","tfsj"],\u6D17\u624B\u95F4:["xishoujian","xsj"],\u6D6E\u5C7F:["fuyu","fy"],\u6D77\u534E\u82D110\u680B:["haihuayuan10dong","hhy10d"],\u6D77\u534E\u82D111\u680B:["haihuayuan11dong","hhy11d"],\u6D77\u534E\u82D112\u680B:["haihuayuan12dong","hhy12d"],\u6D77\u534E\u82D113\u680B:["haihuayuan13dong","hhy13d"],\u6D77\u534E\u82D114\u680B:["haihuayuan14dong","hhy14d"],\u6D77\u534E\u82D115\u680B:["haihuayuan15dong","hhy15d"],\u6D77\u534E\u82D11\u680B:["haihuayuan1dong","hhy1d"],\u6D77\u534E\u82D12\u680B:["haihuayuan2dong","hhy2d"],\u6D77\u534E\u82D13\u680B:["haihuayuan3dong","hhy3d"],\u6D77\u534E\u82D16\u680B:["haihuayuan6dong","hhy6d"],\u6D77\u534E\u82D17\u680B:["haihuayuan7dong","hhy7d"],\u6D77\u534E\u82D18\u680B:["haihuayuan8dong","hhy8d"],\u6D77\u534E\u82D19\u680B:["haihuayuan9dong","hhy9d"],\u6D77\u5357\u9E21\u996D:["hainanjifan","hnjf"],\u6D78\u4F1A\u5927\u5B66\u4E1C:["jinhuidaxuedong","jhdxd"],\u6D78\u4F1A\u5927\u5B66\u8DEF:["jinhuidaxuelu","jhdxl"],\u6D88\u9632\u6813:["xiaofangshuan","xfs"],\u6D88\u9632\u6C34\u6C60:["xiaofangshuichi","xfsc"],\u6D88\u9632\u7AD9:["xiaofangzhan","xfz"],"\u6E1D\u638C\u67DC \u677F\u51F3\u9762":["yuzhanggui bandengmian","yzg bdm"],\u6E2F\u4FE1\u9A7E\u6821:["gangxinjiaxiao","gxjx"],\u6E2F\u5F0F\u5C0F\u53A8:["gangshixiaochu","gsxc"],\u6E2F\u5F0F\u70E7\u814A:["gangshishaola","gssl"],"\u6E2F\u5F0F\u8336\u9910\u5385\u2022\u6252\u996D":["gangshichacanting\u2022bafan","gscct\u2022bf"],\u6E38\u4E50\u573A:["youlechang","ylc"],\u6E38\u6CF3\u6C60:["youyongchi","yyc"],\u6E38\u6CF3\u9986:["youyongguan","yyg"],\u6E56\u7554\u9910\u5385:["hupancanting","hpct"],\u6E58\u805A\u7F18:["xiangjuyuan","xjy"],\u6EA2\u9999\u6E90:["yixiangyuan","yxy"],"\u6EA2\u9999\u6E90 A\u5E97":["yixiangyuan Adian","yxy Ad"],"\u6EA2\u9999\u6E90 B\u5E97":["yixiangyuan Bdian","yxy Bd"],\u6EF4\u6EF4\u8F66\u7AD9:["didichezhan","ddcz"],\u6F14\u827A\u5385:["yanyiting","yyt"],"\u6F6E\u5BA2\u6808\uFF08\u5510\u5BB6\u6E7E\u7AD9\u5B81\u5802\u5E97\uFF09":["chaokezhan\uFF08tangjiawanzhanningtangdian\uFF09","ckz\uFF08tjwzntd\uFF09"],"\u70E9\u574A \u6CE5\u7168\u9E21":["huifang niweiji","hf nwj"],\u71D5\u534E\u6C60:["yanhuachi","yhc"],\u71D5\u534E\u82D1:["yanhuayuan","yhy"],\u71D5\u534E\u82D11\u680B:["yanhuayuan1dong","yhy1d"],\u71D5\u534E\u82D12\u680B:["yanhuayuan2dong","yhy2d"],\u71D5\u534E\u82D13\u680B:["yanhuayuan3dong","yhy3d"],\u71D5\u534E\u82D14\u680B:["yanhuayuan4dong","yhy4d"],\u71D5\u534E\u82D15\u680B:["yanhuayuan5dong","yhy5d"],\u71D5\u534E\u82D16\u680B:["yanhuayuan6dong","yhy6d"],\u71D5\u534E\u82D17\u680B:["yanhuayuan7dong","yhy7d"],\u71D5\u534E\u82D18\u680B:["yanhuayuan8dong","yhy8d"],"\u725B\u5764\u8BB0 \u6C99\u53BF\u5C0F\u5403":["niukunji shaxianxiaochi","nkj sxxc"],"\u725B\u8089\u9762\xB7\u4E1C\u5317\u997A\u5B50\xB7\u87BA\u86F3\u7C89":["niuroumian\xB7dongbeijiaozi\xB7luosifen","nrm\xB7dbjz\xB7lsf"],\u725B\u8089\u996D:["niuroufan","nrf"],\u7269\u4E1A\u7BA1\u7406\u5904:["wuyeguanlichu","wyglc"],"\u738B\u559C\u5CF0 Spicy Hot Pot":["wangxifeng Spicy Hot Pot","wxf Spicy Hot Pot"],\u73E0\u5F71\u8D85\u5E02:["zhuyingchaoshi","zycs"],\u73E0\u6D77\u4E00\u5BBF\u6C11\u5BBF:["zhuhaiyisuminsu","zhysms"],\u73E0\u6D77\u4E2B\u4E00\u516C\u5BD3:["zhuhaiyayigongyu","zhyygy"],\u73E0\u6D77\u4F0A\u4EBA\u5BA2\u6808:["zhuhaiyirenkezhan","zhyrkz"],\u73E0\u6D77\u53CB\u60C5\u516C\u5BD3:["zhuhaiyouqinggongyu","zhyqgy"],\u73E0\u6D77\u540D\u5C45\u516C\u5BD3:["zhuhaimingjugongyu","zhmjgy"],\u73E0\u6D77\u5B9D\u8D1D\u6C11\u5BBF:["zhuhaibaobeiminsu","zhbbms"],\u73E0\u6D77\u5DE6\u5CB8\u4E3B\u9898\u516C\u5BD3:["zhuhaizuoanzhutigongyu","zhzaztgy"],\u73E0\u6D77\u5E02\u6B27\u4E9A\u6280\u5DE5\u5B66\u6821:["zhuhaishiouyajigongxuexiao","zhsoyjgxx"],\u73E0\u6D77\u5E02\u80B2\u5FB7\u5B66\u6821:["zhuhaishiyudexuexiao","zhsydxx"],\u73E0\u6D77\u5E02\u91D1\u9F0E\u4E2D\u5B66:["zhuhaishijindingzhongxue","zhsjdzx"],\u73E0\u6D77\u6708\u4EAE\u6E7E\u516C\u5BD3:["zhuhaiyueliangwangongyu","zhylwgy"],\u73E0\u6D77\u683C\u529B\u804C\u4E1A\u5B66\u9662:["zhuhaigelizhiyexueyuan","zhglzyxy"],\u73E0\u6D77\u6C81\u56ED\u9152\u5E97\u516C\u5BD3:["zhuhaiqinyuanjiudiangongyu","zhqyjdgy"],\u73E0\u6D77\u82B1\u60A6\u5BA2\u6808:["zhuhaihuayuekezhan","zhhykz"],\u73E0\u6D77\u82B1\u6837\u5E74\u534E\u516C\u5BD3:["zhuhaihuayangnianhuagongyu","zhhynhgy"],\u73E0\u6D77\u82F1\u640F\u5C14\u65B0\u80FD\u6E90\u6C7D\u8F66\u52A8\u529B\u603B\u6210\u5DE5\u5382:["zhuhaiyingboerxinnengyuanqichedonglizongchenggongchang","zhybexnyqcdlzcgc"],\u73E0\u6D77\u84DD\u6E7E\u516C\u5BD3:["zhuhailanwangongyu","zhlwgy"],\u73E0\u6D77\u8F6C\u89D2\u516C\u5BD3:["zhuhaizhuanjiaogongyu","zhzjgy"],\u73E0\u6D77\u9999\u683C\u91CC\u62C9\u516C\u5BD3:["zhuhaixianggelilagongyu","zhxgllgy"],\u73E0\u6D77\u9AD8\u65B0\u533A\u4EBA\u6C11\u533B\u9662:["zhuhaigaoxinqurenminyiyuan","zhgxqrmyy"],\u73E0\u6D77\u9AD8\u65B0\u533A\u53E4\u5143\u5C0F\u5B66:["zhuhaigaoxinquguyuanxiaoxue","zhgxqgyxx"],\u73E0\u6D77\u9AD8\u65B0\u533A\u6C38\u4E30\u5C0F\u5B66:["zhuhaigaoxinquyongfengxiaoxue","zhgxqyfxx"],\u73E0\u6D77\u9AD8\u65B0\u5B9D\u9F99\u5E7F\u573A:["zhuhaigaoxinbaolongguangchang","zhgxblgc"],\u73E0\u6E20\u5317\u8DEF:["zhuqubeilu","zqbl"],\u7422\u4E50\u6C47:["zhuolehui","zlh"],\u745E\u5E78\u5496\u5561:["ruixingkafei","rxkf"],\u76CA\u79BE\u5802:["yihetang","yht"],\u77E5\u884C\u697C:["zhixinglou","zxl"],\u798F\u5EFA\u5C0F\u5403:["fujianxiaochi","fjxc"],\u79CB\u94ED\u6C11\u5BBF:["qiumingminsu","qmms"],\u79D1\u76EE\u4E8C\u8003\u8BD5\u573A\u5730:["kemuerkaoshichangdi","kmekscd"],\u79D1\u96C5\u82D1:["keyayuan","kyy"],"\u7A46\u5473\u738B\n\u79C1\u623F\u725B\u8089\u9762":[`muweiwang
sifangniuroumian`,`mww
sfnrm`],\u7ACB\u8EAB\u8F69:["lishenxuan","lsx"],"\u7B80 Hair Saloon":["jian Hair Saloon","j Hair Saloon"],\u7B80\u4E5F\u8336\u96C6:["jianyechaji","jycj"],\u7B80\u7F8E\u6C11\u5BBF:["jianmeiminsu","jmms"],\u7BEE\u7403\u573A:["lanqiuchang","lqc"],\u7CA4\u534E\u82D110\u680B:["yuehuayuan10dong","yhy10d"],\u7CA4\u534E\u82D111\u680B:["yuehuayuan11dong","yhy11d"],\u7CA4\u534E\u82D114\u680B:["yuehuayuan14dong","yhy14d"],\u7CA4\u534E\u82D115\u680B:["yuehuayuan15dong","yhy15d"],\u7CA4\u534E\u82D116\u680B:["yuehuayuan16dong","yhy16d"],\u7CA4\u534E\u82D117\u680B:["yuehuayuan17dong","yhy17d"],\u7CA4\u534E\u82D118\u680B:["yuehuayuan18dong","yhy18d"],\u7CA4\u534E\u82D119\u680B:["yuehuayuan19dong","yhy19d"],\u7CA4\u534E\u82D11\u680B:["yuehuayuan1dong","yhy1d"],\u7CA4\u534E\u82D120\u680B:["yuehuayuan20dong","yhy20d"],\u7CA4\u534E\u82D121\u680B:["yuehuayuan21dong","yhy21d"],\u7CA4\u534E\u82D122\u680B:["yuehuayuan22dong","yhy22d"],\u7CA4\u534E\u82D12\u680B:["yuehuayuan2dong","yhy2d"],\u7CA4\u534E\u82D13\u680B:["yuehuayuan3dong","yhy3d"],\u7CA4\u534E\u82D14\u680B:["yuehuayuan4dong","yhy4d"],\u7CA4\u534E\u82D15\u680B:["yuehuayuan5dong","yhy5d"],\u7CA4\u534E\u82D16\u680B:["yuehuayuan6dong","yhy6d"],\u7CA4\u534E\u82D17\u680B:["yuehuayuan7dong","yhy7d"],\u7CA4\u534E\u82D18\u680B:["yuehuayuan8dong","yhy8d"],\u7CA4\u534E\u82D19\u680B:["yuehuayuan9dong","yhy9d"],\u7CA4\u534E\u82D1\u8336\u9910\u5385:["yuehuayuanchacanting","yhycct"],\u7CBE\u5DE5\u697C:["jinggonglou","jgl"],\u7CBE\u5DE5\u8DEF:["jinggonglu","jgl"],\u7D20\u62D3\u57FA\u5730:["sutuojidi","stjd"],\u7EB3\u6C34\u5317\u73AF\u8DEF:["nashuibeihuanlu","nsbhl"],\u7EF4\u4E5F\u7EB3\u56FD\u9645\u9152\u5E97:["weiyenaguojijiudian","wyngjjd"],\u7EFF\u690D:["l\xFCzhi","lz"],\u7F25\u96EA:["piaoxue","px"],\u7F51\u7403\u573A:["wangqiuchang","wqc"],\u7F57\u5E78\u6751:["luoxingcun","lxc"],\u7F8E\u5B9C\u4F73:["meiyijia","myj"],\u7FE0\u6E56\u58EB\u591A\u4FBF\u5229\u5E97:["cuihushiduobianlidian","chsdbld"],\u8001\u5C4B\u5496\u5561:["laowukafei","lwkf"],"\u8001\u7897\u4F1A\xB7\u9655\u897F\u624B\u5DE5\u9762\uFF08\u73E0\u6D77\u5B9D\u9F99\u5E97\uFF09":["laowanhui\xB7shanxishougongmian\uFF08zhuhaibaolongdian\uFF09","lwh\xB7sxsgm\uFF08zhbld\uFF09"],\u80AF\u5FB7\u57FA:["kendeji","kdj"],\u81EA\u884C\u8F66\u505C\u8F66\u5904:["zixingchetingchechu","zxctcc"],\u81EA\u9009\u997A\u5B50:["zixuanjiaozi","zxjz"],\u81FB\u82D1\u79C1\u53A8:["zhenyuansichu","zysc"],\u827A\u5CEF:["yifeng","yf"],\u827A\u60A6\u697C:["yiyuelou","yyl"],\u827A\u672F\u6797:["yishulin","ysl"],\u82B1\u56ED:["huayuan","hy"],\u82B1\u5C7F:["huayu","hy"],"\u82B1\u7532\u7C89 \u7802\u9505\u7C73\u7EBF":["huajiafen shaguomixian","hjf sgmx"],\u82B1\u95F4\u5C0F\u70B9:["huajianxiaodian","hjxd"],\u82F1\u8BED\u8BED\u8A00\u4E2D\u5FC3:["yingyuyuyanzhongxin","yyyyzx"],\u8336\u767E\u9053:["chabaidao","cbd"],\u8349\u5730\u516C\u56ED:["caodigongyuan","cdgy"],\u8354\u56ED\u767E\u8D27\u8D85\u5E02:["liyuanbaihuochaoshi","lybhcs"],\u8354\u679D\u516C\u56ED:["lizhigongyuan","lzgy"],\u8354\u679D\u56ED:["lizhiyuan","lzy"],\u8354\u679D\u5C9B:["lizhidao","lzd"],\u8354\u679D\u5C9B\u516C\u56ED:["lizhidaogongyuan","lzdgy"],\u8363\u4E00\u8FDE\u9501\u8D85\u5E02:["rongyiliansuochaoshi","rylscs"],\u8377\u9999\u6E56:["hexianghu","hxh"],\u83AB\u6C0F\u5927\u5B97\u7960:["moshidazongci","msdzc"],\u83DC\u9E1F\u9A7F\u7AD9:["cainiaoyizhan","cnyz"],\u8700\u9999\u56ED:["shuxiangyuan","sxy"],\u8702\u5DE2\u5FEB\u9012\u67DC:["fengchaokuaidigui","fckdg"],\u8708\u86A3\u5CAD:["wugongling","wgl"],\u871C\u96EA\u51B0\u57CE:["mixuebingcheng","mxbc"],\u873B\u8713\u6E7E:["qingtingwan","qtw"],\u884C\u653F\u697C:["xingzhenglou","xzl"],\u897F\u533A\u505C\u8F66\u573A:["xiqutingchechang","xqtcc"],\u897F\u8DB3\u7403\u573A:["xizuqiuchang","xzqc"],\u897F\u95E8:["ximen","xm"],\u8BA1\u7B97\u673A\u4E2D\u5FC3:["jisuanjizhongxin","jsjzx"],\u8BA1\u7B97\u673A\u5B66\u9662:["jisuanjixueyuan","jsjxy"],"\u8BB0\u5FC6\u5C0F\u7B3C\u5305 \u539F\u5473\u6C64\u7C89\u738B":["jiyixiaolongbao yuanweitangfenwang","jyxlb ywtfw"],\u8BBE\u8BA1\u4E0E\u827A\u672F\u5B66\u9662:["shejiyuyishuxueyuan","sjyysxy"],\u8BFB\u4E66\u5C9B:["dushudao","dsd"],\u8C03\u6885\u7960:["tiaomeici","tmc"],\u8D24\u8D24\u5C45\u9910\u5385:["xianxianjucanting","xxjct"],\u8D5B\u767E\u5473:["saibaiwei","sbw"],\u8D64\u82B1\u5C71:["chihuashan","chs"],\u8D64\u82B1\u5C71\u8DEF:["chihuashanlu","chsl"],\u8D75\u8BB0\u4F20\u627F:["zhaojichuancheng","zjcc"],\u8FD0\u52A8\u573A:["yundongchang","ydc"],\u9047\u89C1:["yujian","yj"],\u9047\u89C1\u5C0F\u9762:["yujianxiaomian","yjxm"],\u9053\u95F8:["daozha","dz"],\u906E\u96E8\u68DA:["zheyupeng","zyp"],\u90A3\u4E1C\u4E09\u8DEF:["nadongsanlu","ndsl"],\u90A3\u6D32:["nazhou","nz"],\u90A3\u6D32\u5C0F\u5B66:["nazhouxiaoxue","nzxx"],\u90A3\u6D32\u724C\u574A:["nazhoupaifang","nzpf"],\u90A3\u6D32\u7EFF\u9053:["nazhoul\xFCdao","nzld"],\u90A3\u6D32\u827A\u672F\u521B\u65B0\u56ED\u533A:["nazhouyishuchuangxinyuanqu","nzyscxyq"],\u90A3\u6D32\u9AD8\u901F\u8DEF\u53E3:["nazhougaosulukou","nzgslk"],\u90A3\u6EAA\u624B\u4F5C\u8336\u679C:["naxishouzuochaguo","nxszcg"],\u91CD\u5E86\u5C0F\u9762:["chongqingxiaomian","cqxm"],\u91CD\u5E86\u9E21\u516C\u7172:["chongqingjigongbao","cqjgb"],\u91D1\u4E1A\u4E00\u8DEF:["jinyeyilu","jyyl"],\u91D1\u4E30\u4E8C\u8DEF:["jinfengerlu","jfel"],\u91D1\u51E4\u5C0F\u5B66:["jinfengxiaoxue","jfxx"],\u91D1\u540C\u8DEF:["jintonglu","jtl"],\u91D1\u54C1\u4E00\u8DEF:["jinpinyilu","jpyl"],\u91D1\u54C1\u4E8C\u8DEF:["jinpinerlu","jpel"],\u91D1\u56ED\u516D\u8DEF:["jinyuanliulu","jyll"],\u91D1\u56ED\u8DEF\u53E3:["jinyuanlukou","jylk"],\u91D1\u56FE\u8DEF:["jintulu","jtl"],\u91D1\u5706\u4E8C\u8DEF\u53E3:["jinyuanerlukou","jyelk"],\u91D1\u58F0\u697C:["jinshenglou","jsl"],\u91D1\u5CF0\u5317\u8DEF\u5357:["jinfengbeilunan","jfbln"],\u91D1\u5CF0\u793E\u533A:["jinfengshequ","jfsq"],\u91D1\u5CF0\u897F\u8DEF:["jinfengxilu","jfxl"],\u91D1\u6052\u4E00\u8DEF:["jinhengyilu","jhyl"],\u91D1\u6052\u4E00\u8DEF\u4E2D:["jinhengyiluzhong","jhylz"],\u91D1\u6052\u4E8C\u8DEF:["jinhengerlu","jhel"],\u91D1\u6842\u8DEF:["jinguilu","jgl"],\u91D1\u6B67\u8DEF:["jinqilu","jql"],\u91D1\u6C38\u4E00\u8DEF:["jinyongyilu","jyyl"],\u91D1\u6C38\u4E8C\u8DEF:["jinyongerlu","jyel"],\u91D1\u6D32\u4E94\u8DEF:["jinzhouwulu","jzwl"],\u91D1\u6D32\u56DB\u8DEF:["jinzhousilu","jzsl"],\u91D1\u6D32\u8DEF:["jinzhoulu","jzl"],\u91D1\u6EAA\u5927\u9053:["jinxidadao","jxdd"],\u91D1\u7115\u8DEF:["jinhuanlu","jhl"],\u91D1\u73AF\u8DEF:["jinhuanlu","jhl"],\u91D1\u745E\u4E00\u8DEF:["jinruiyilu","jryl"],\u91D1\u745E\u4E8C\u8DEF\u897F:["jinruierluxi","jrelx"],\u91D1\u878D\u5546\u52A1\u4E2D\u5FC3:["jinrongshangwuzhongxin","jrswzx"],\u91D1\u9E3F\u4E03\u8DEF:["jinhongqilu","jhql"],\u91D1\u9E3F\u4E09\u8DEF:["jinhongsanlu","jhsl"],\u91D1\u9E3F\u4E94\u8DEF:["jinhongwulu","jhwl"],\u91D1\u9E3F\u516D\u8DEF:["jinhongliulu","jhll"],\u91D1\u9E3F\u516D\u8DEF\u5317:["jinhongliulubei","jhllb"],\u91D1\u9E3F\u516D\u8DEF\u53E3:["jinhongliulukou","jhllk"],\u91D1\u9E3F\u56DB\u8DEF:["jinhongsilu","jhsl"],\u91D1\u9F0E:["jinding","jd"],"\u91D1\u9F0E(\u4E0B\u5BA2\u533A)":["jinding(xiakequ)","jd(xkq)"],\u91D1\u9F0E\u4E2D\u5B66:["jindingzhongxue","jdzx"],\u91D1\u9F0E\u4E2D\u5B66\u5317:["jindingzhongxuebei","jdzxb"],\u91D1\u9F0E\u4E2D\u5B66\u8DEF:["jindingzhongxuelu","jdzxl"],\u91D1\u9F0E\u5DE5\u4E1A\u56ED:["jindinggongyeyuan","jdgyy"],\u91D1\u9F0E\u5E02\u573A:["jindingshichang","jdsc"],\u91D1\u9F0E\u6587\u5316\u4F53\u80B2\u5E7F\u573A:["jindingwenhuatiyuguangchang","jdwhtygc"],\u91D1\u9F0E\u6587\u5316\u5E7F\u573A:["jindingwenhuaguangchang","jdwhgc"],\u91D1\u9F0E\u9547:["jindingzhen","jdz"],\u946B\u68A6\u56ED:["xinmengyuan","xmy"],\u946B\u8302\u6C64\u5305\u738B:["xinmaotangbaowang","xmtbw"],\u9547\u6B63\u5751\u6C34\u5E93:["zhenzhengkengshuiku","zzksk"],\u957F\u5357\u8FF3\u53E4\u9053\u5317:["changnanjinggudaobei","cnjgdb"],\u957F\u56ED\u7535\u529B:["changyuandianli","cydl"],\u95FB\u521B\u8DEF:["wenchuanglu","wcl"],\u95FB\u77E5\u8DEF:["wenzhilu","wzl"],"\u963F\u59E8\u70E7\u814A \u732A\u811A":["ayishaola zhujiao","aysl zj"],\u9694\u79BB\u67F1:["gelizhu","glz"],\u96FE\u9C9C:["wuxian","wx"],\u971E\u5357\u8857:["xiananjie","xnj"],\u9752\u5E74\u6559\u5E08\u516C\u5BD3:["qingnianjiaoshigongyu","qnjsgy"],\u9752\u79BE\u5DF7\u88E1:["qinghexiangli","qhxl"],\u987A\u4E30\u901F\u8FD0:["shunfengsuyun","sfsy"],\u987A\u5FB7\u5E72\u84B8\u83DC:["shundeganzhengcai","sdgzc"],\u98CE\u96E8\u64CD\u573A:["fengyucaochang","fycc"],\u98DF\u5176\u5BB6:["shiqijia","sqj"],\u98DF\u5802:["shitang","st"],\u9910\u5385:["canting","ct"],\u996D\u5E08\u5144:["fanshixiong","fsx"],\u9999\u5C71\u4F1A\u8BAE\u4E2D\u5FC3:["xiangshanhuiyizhongxin","xshyzx"],\u9999\u5C71\u8DEF:["xiangshanlu","xsl"],\u9999\u5C71\u8DEF\u897F:["xiangshanluxi","xslx"],\u9999\u6A1F\u56ED:["xiangzhangyuan","xzy"],\u9999\u6D32\u70B8\u6392\u9AA8:["xiangzhouzhapaigu","xzzpg"],\u9999\u7EAF\u8336\u6808:["xiangchunchazhan","xccz"],\u9AD8\u624B\u5364\u8089\u996D:["gaoshouluroufan","gslrf"],\u9AD8\u65B0\u533A\u4EBA\u6C11\u533B\u9662:["gaoxinqurenminyiyuan","gxqrmyy"],\u9AD8\u65B0\u533A\u79FB\u6C11\u4E8B\u52A1\u670D\u52A1\u4E2D\u5FC3:["gaoxinquyiminshiwufuwuzhongxin","gxqymswfwzx"],\u9AD8\u65B0\u533A\u91D1\u9F0E\u7B2C\u4E00\u5C0F\u5B66:["gaoxinqujindingdiyixiaoxue","gxqjddyxx"],"\u9AD8\u65B0\u533A\uFF08\u6B63\u5751\u6C34\u5E93\uFF09\u751F\u6D3B\u5783\u573E\u8F6C\u8FD0\u7AD9":["gaoxinqu\uFF08zhengkengshuiku\uFF09shenghuolajizhuanyunzhan","gxq\uFF08zksk\uFF09shljzyz"],\u9AD8\u7B49\u7814\u7A76\u9662:["gaodengyanjiuyuan","gdyjy"],\u9E3F\u65B0\u8857\u53E3:["hongxinjiekou","hxjk"],\u9EA6\u5F53\u52B3:["maidanglao","mdl"],\u9EBB\u8FA3\u70EB:["malatang","mlt"],\u9EBB\u8FA3\u9999\u9505:["malaxiangguo","mlxg"],\u9EC4\u5927\u53A8\u9EBB\u8FA3\u70EB:["huangdachumalatang","hdcmlt"],\u9EC4\u6587\u79C0\u5E7F\u573A:["huangwenxiuguangchang","hwxgc"],\u9EC4\u7116\u9E21\u7C73\u996D:["huangmenjimifan","hmjmf"]};var ou;async function Kd(i){i.some(e=>!Object.hasOwn(Ro,e))&&(ou=(await import("./chunks/esm-NUV22FAU.js")).pinyin)}function Jd(i){if(Object.hasOwn(Ro,i))return Ro[i];if(!ou)throw Error("Search spelling was not prepared");let e=ou(i,{toneType:"none",type:"array"});return[e.join(""),e.map(t=>t[0]||"").join("")]}var Xn={dormitory:"\u5BBF\u820D\u697C",university:"\u6559\u5B66\u697C",building:"\u5176\u4ED6\u5EFA\u7B51",restaurant:"\u9910\u5385",cafe:"\u5496\u5561\u4E0E\u8336\u996E",food_court:"\u98DF\u5802",fast_food:"\u5FEB\u9910",shop:"\u5546\u5E97",office:"\u529E\u516C\u5BA4",parking:"\u505C\u8F66\u573A",bicycle_parking:"\u81EA\u884C\u8F66\u505C\u8F66\u5904",parking_entrance:"\u505C\u8F66\u573A\u5165\u53E3",toilets:"\u6D17\u624B\u95F4",atm:"ATM",drinking_water:"\u996E\u6C34\u5904",bench:"\u4F11\u606F\u5EA7\u6905",defibrillator:"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668",fire_hydrant:"\u6D88\u9632\u6813",fire_station:"\u6D88\u9632\u7AD9",lost_property_office:"\u5931\u7269\u62DB\u9886\u5904",waste_disposal:"\u5783\u573E\u56DE\u6536\u70B9",waste_transfer_station:"\u5783\u573E\u4E2D\u8F6C\u7AD9",healthcare:"\u533B\u7597",tourism:"\u6587\u5316\u666F\u70B9",leisure:"\u4F11\u95F2\u8BBE\u65BD",entrance:"\u51FA\u5165\u53E3",amenity:"\u5176\u4ED6\u8BBE\u65BD",other:"\u5176\u4ED6\u5730\u70B9",bus_stop:"\u516C\u4EA4\u7AD9",road:"\u9053\u8DEF",public_transport:"\u516C\u5171\u4EA4\u901A",library:"\u56FE\u4E66\u9986",school:"\u5B66\u6821",college:"\u5B66\u9662",bank:"\u94F6\u884C",post_office:"\u90AE\u653F\u4E0E\u5FEB\u9012",parcel_locker:"\u5FEB\u9012\u67DC",shelter:"\u906E\u96E8\u68DA",waste_basket:"\u5783\u573E\u6876",charging_station:"\u5145\u7535\u7AD9",pitch:"\u8FD0\u52A8\u573A",garden:"\u82B1\u56ED",park:"\u516C\u56ED",sports_centre:"\u4F53\u80B2\u4E2D\u5FC3",swimming_pool:"\u6E38\u6CF3\u6C60",stadium:"\u4F53\u80B2\u573A",playground:"\u6E38\u4E50\u573A",golf_course:"\u9AD8\u5C14\u592B\u7403\u573A",gate:"\u51FA\u5165\u53E3",lift_gate:"\u9053\u95F8",bollard:"\u9694\u79BB\u67F1",water:"\u6C34\u57DF",peak:"\u5C71\u5CF0",place:"\u5730\u540D"};function Wi(i={}){return i.highway==="bus_stop"?"bus_stop":i.highway==="road"?"road":i.public_transport||i.railway?"public_transport":i.emergency?Xn[i.emergency]?i.emergency:"amenity":i.healthcare||["hospital","clinic","pharmacy","doctors","dentist"].includes(i.amenity)?"healthcare":i.shop?"shop":i.office?i.office==="lost_property"?"lost_property_office":"office":i.amenity&&Xn[i.amenity]?i.amenity:i.building?["dormitory","university"].includes(i.building)?i.building:"building":i.entrance?"entrance":i.barrier&&Xn[i.barrier]?i.barrier:i.natural&&Xn[i.natural]?i.natural:i.place?"place":i.tourism?"tourism":i.leisure?Xn[i.leisure]?i.leisure:"leisure":i.amenity?"amenity":"other"}function lu(i={}){return i.amenity==="atm"?[i.operator||i.brand,"ATM"].filter(Boolean).join(" "):Xn[Wi(i)]||"\u672A\u547D\u540D\u5730\u70B9"}function Ig(i){let e=i.tags||{};return[["\u82F1\u6587\u540D\u79F0",i.name_en],["\u7C7B\u578B",Xn[Wi(e)]],["\u6240\u5728\u5EFA\u7B51",i.building_name],["\u697C\u5C42",i.floor||e["level:ref"]||e.level],["\u4F4D\u7F6E",[e["addr:street"],e["addr:housenumber"],e["addr:unit"],e["addr:door"]].filter(Boolean).join(" \xB7 ")],["\u8425\u4E1A\u65F6\u95F4",e.opening_hours],["\u8BBE\u65BD",e.amenity],["\u5EFA\u7B51\u7528\u9014",e.building!=="yes"?e.building:null],["\u5546\u5E97\u7C7B\u578B",e.shop],["\u54C1\u724C",e.brand],["\u8FD0\u8425\u65B9",e.operator],["\u83DC\u7CFB",e.cuisine],["\u5E94\u6025\u8BBE\u65BD",e.emergency],["\u8BBE\u5907\u4F4D\u7F6E",e["defibrillator:location"]],["\u7535\u8BDD",e.phone||e["contact:phone"]],["\u90AE\u7BB1",e.email||e["contact:email"]],["\u7F51\u7AD9",e.website||e["contact:website"]],["\u901A\u884C\u6761\u4EF6",e.access],["\u65E0\u969C\u788D",e.wheelchair],["\u5907\u6CE8",e.note],["\u63CF\u8FF0",e.description],["\u5730\u56FE\u5750\u6807",Number.isFinite(i.lon)&&Number.isFinite(i.lat)?`${i.lon.toFixed(6)}, ${i.lat.toFixed(6)}`:null]].filter(([,t])=>t!=null&&String(t).trim())}function Dg(i,e){let t=String(e).trim();if(i==="\u7F51\u7AD9")try{let n=new URL(t);if(["http:","https:"].includes(n.protocol))return n.href}catch{}return i==="\u7535\u8BDD"&&/^[+\d\s();-]{3,70}$/.test(t)?"tel:"+t.replace(/[\s()]/g,""):i==="\u90AE\u7BB1"&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(t)?"mailto:"+encodeURIComponent(t):null}function cu(i,e){let t=document.createElement("dl");for(let[a,o]of Ig(e)){let l=document.createElement("dt"),c=document.createElement("dd");l.textContent=a;let u=Dg(a,o);if(u){let h=document.createElement("a");h.textContent=o,h.href=u,u.startsWith("http")&&(h.target="_blank",h.rel="noreferrer"),c.append(h)}else c.textContent=o;t.append(l,c)}i.append(t);let n=document.createElement("details");n.className="part-records";let s=document.createElement("summary");s.textContent="\u5168\u90E8\u516C\u5F00\u5C5E\u6027",n.append(s);let r=document.createElement("dl");for(let[a,o]of Object.entries(e.tags||{})){let l=document.createElement("dt"),c=document.createElement("dd");l.textContent=a,c.textContent=o,r.append(l,c)}if(n.append(r),i.append(n),e.mapSources?.length){let a=document.createElement("details");a.className="part-records";let o=document.createElement("summary");o.textContent="\u6E90\u5730\u56FE\u5730\u70B9\u4FE1\u606F",a.append(o);let l=document.createElement("p");l.textContent=e.vectorOnly?"\u4F4D\u7F6E\u91C7\u7528\u6E90\u5730\u56FE\u6807\u6CE8\u70B9\uFF1B\u697C\u5C42\u672A\u6807\u6CE8\u65F6\u4FDD\u6301\u7A7A\u767D\u3002":"\u5DF2\u4E0E\u539F\u6709\u5730\u70B9\u5408\u5E76\uFF0C\u4FDD\u7559\u539F\u59CB\u5750\u6807\u4E0E\u516C\u5F00\u5C5E\u6027\u3002",a.append(l);for(let c of e.mapSources){let u=document.createElement("p");u.textContent=`${c.dataset==="full"?"\u5B8C\u6574\u5730\u56FE":"\u57FA\u7840\u5730\u56FE"} \xB7 ${c.layer}`,a.append(u);let h=document.createElement("dl");for(let[d,f]of Object.entries(c.properties)){let g=document.createElement("dt"),_=document.createElement("dd");g.textContent=d,_.textContent=String(f),h.append(g,_)}a.append(h)}i.append(a)}}var ri=[["all","\u5168\u90E8"],["dining","\u9910\u996E"],["shop","\u5546\u5E97"],["transport","\u4EA4\u901A"],["health","\u533B\u7597"],["facility","\u8BBE\u65BD"],["office","\u529E\u516C"],["leisure","\u4F11\u95F2"],["culture","\u6587\u5316"],["entrance","\u5165\u53E3"],["other","\u5176\u4ED6"]];function Lg(i){return i.highway==="bus_stop"||i.public_transport||i.railway||i.highway==="road"?"transport":i.emergency||i.healthcare||["clinic","hospital","pharmacy","doctors","dentist"].includes(i.amenity)?"health":["restaurant","cafe","fast_food","food_court","bar","ice_cream"].includes(i.amenity)?"dining":i.shop?"shop":i.office?"office":i.entrance||["gate","lift_gate"].includes(i.barrier)?"entrance":i.tourism?"culture":i.leisure?"leisure":i.amenity?"facility":"other"}function Ug(i){let e={defibrillator:"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668",fire_hydrant:"\u6D88\u9632\u6813",toilets:"\u6D17\u624B\u95F4",drinking_water:"\u996E\u6C34\u5904",atm:"ATM",bench:"\u4F11\u606F\u5EA7\u6905",parking:"\u505C\u8F66\u573A",bicycle_parking:"\u81EA\u884C\u8F66\u505C\u8F66\u5904",lost_property_office:"\u5931\u7269\u62DB\u9886",entrance:"\u51FA\u5165\u53E3"};return i["name:zh"]||i.name||i["name:en"]||(i.amenity==="atm"?lu(i):null)||e[i.emergency]||e[i.amenity]||(i.entrance?e.entrance:null)||i.brand||lu(i)}function Si(i,e,t=[113.513,22.358]){let n=Math.PI/180,s=6378137,r=.00669437999014;function a(d,f){let g=f*n,_=d*n,m=s/Math.sqrt(1-r*Math.sin(g)**2);return[m*Math.cos(g)*Math.cos(_),m*Math.cos(g)*Math.sin(_),m*(1-r)*Math.sin(g)]}let o=a(i,e),l=a(...t),c=o.map((d,f)=>d-l[f]),u=t[0]*n,h=t[1]*n;return[-Math.sin(u)*c[0]+Math.cos(u)*c[1],-Math.sin(h)*Math.cos(u)*c[0]-Math.sin(h)*Math.sin(u)*c[1]+Math.cos(h)*c[2]]}function Qd(i,e){let t=!1;for(let n=0,s=e.length-1;n<e.length;s=n++){let r=e[n],a=e[s];r[1]>i[1]!=a[1]>i[1]&&i[0]<(a[0]-r[0])*(i[1]-r[1])/(a[1]-r[1])+r[0]&&(t=!t)}return t}var uu=new WeakMap;function ef(i,e){let t=new Map(e.map(n=>[n.id,n]));return i.map(n=>{let s=t.get(n.id);return s?{...n,publicPlace:s,mapSources:s.mapSources,name_en:n.name_en||s.name_en,tags:{...n.tags,...s.tags},display_name:n.display_name||(/^未命名/.test(n.name)&&!/^未命名/.test(s.name)?s.name:n.name),aliases:[n.aliases||"",s.name,s.name_en,s.tags.short_name||""].join(" ")}:n})}function hu(i){if(uu.has(i))return uu.get(i);let e=i.display_name||i.name||"",t=i.tags||{},[n,s]=Jd(e),r=(ri.find(([l])=>l===i.category)?.[1]||"")+" "+Xn[Wi(t)],a=(i.mapSources||[]).flatMap(l=>Object.entries(l.properties).filter(([c])=>/name|ref/.test(c)).map(([,c])=>c)),o=[e,i.name_en,i.id,i.aliases,r,n,s,...Object.values(t),...a].join(" ").normalize("NFKC").toLowerCase().replace(/\s+/g,"");return uu.set(i,o),o}function tf(i,{query:e="",category:t="all",phase:n="all",floor:s="",favorites:r=null,position:a=null}={}){let o=e.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);return i.filter(l=>(t==="all"||l.category===t)&&(n==="all"||l.phase===n)&&(!s||l.floor===s)&&(!r||r.has(l.id))&&o.every(c=>hu(l).includes(c))).sort((l,c)=>a?Math.hypot(l.centroid[0]-a[0],l.centroid[1]-a[1])-Math.hypot(c.centroid[0]-a[0],c.centroid[1]-a[1]):0)}function nf(i,e){let t=new Set;return i.elements.flatMap(n=>{let s=n.lon??n.center?.lon,r=n.lat??n.center?.lat,a=`${n.type}/${n.id}`,o=n.tags||{};if(!Number.isFinite(s)||!Number.isFinite(r)||t.has(a))return[];t.add(a);let l=Si(s,r);if(Math.hypot(...l)>5e3)return[];let c=e.find(h=>h.geometry.some(d=>Qd(l,d.outer)&&!d.holes.some(f=>Qd(l,f)))),u=c?.phase||(l[1]<0?"1":"2");return[{id:a,kind:"poi",name:Ug(o),name_en:o["name:en"]||"",tags:o,category:Lg(o),centroid:l.map(h=>+h.toFixed(4)),lon:s,lat:r,phase:u,floor:String(o["level:ref"]??o.level??""),building_id:c?.id??null,building_name:c?.display_name||c?.name||"",labelHeight:c?(c.display_height_m??c.height_m)+c.base_elevation_m+2:2,source_url:`https://www.openstreetmap.org/${a}`}]})}function sf(i,e){let t=113.513,n=22.358;for(let s=0;s<4;s++){let[r,a]=Si(t,n),[o,l]=Si(t+1e-5,n),[c,u]=Si(t,n+1e-5),h=(o-r)/1e-5,d=(c-r)/1e-5,f=(l-a)/1e-5,g=(u-a)/1e-5,_=h*g-d*f;t+=((i-r)*g-(e-a)*d)/_,n+=((e-a)*h-(i-r)*f)/_}return{lon:t,lat:n}}function rf({controls:i,focus:e}){let t=document.querySelector("#open-reference-map"),n=document.createElement("dialog");n.className="reference-map-dialog",n.setAttribute("aria-label","\u5B8C\u6574\u5730\u56FE\u8D44\u6E90"),document.body.append(n);let s;t.onclick=()=>{s=document.createElement("iframe"),s.title="\u5B8C\u6574\u6821\u56ED\u77E2\u91CF\u5730\u56FE",s.src="/campus-map/viewer/reference-map.html",s.onload=()=>s.contentWindow.postMessage({type:"reference-map-focus",...sf(i.target.x,-i.target.z)},location.origin),n.replaceChildren(s),n.showModal()},n.addEventListener("close",()=>{s?.remove(),s=null}),window.addEventListener("message",r=>{if(!s||r.source!==s.contentWindow||r.origin!==location.origin)return;let a=r.data;if(a?.type==="reference-map-ready"&&s.contentWindow.postMessage({type:"reference-map-focus",...sf(i.target.x,-i.target.z)},location.origin),a?.type==="reference-map-close"&&n.close(),a?.type==="reference-map-locate"&&Number.isFinite(a.lon)&&Number.isFinite(a.lat)){let o=Si(a.lon,a.lat);if(Math.hypot(...o)>6500)return;n.close(),e(o,a.id)}})}function af(i,e){let t=new Map(i.map(n=>[n.id,n]));for(let n of e?.places||[]){let s=t.get(n.id);s?t.set(n.id,{...s,mapSources:n.mapSources}):t.set(n.id,n)}return[...t.values()]}function of(i,e,{query:t="",scope:n="buildings",category:s="all"}={}){return t.trim()||n!=="buildings"||s!=="all"||e.favoritesOnly?new Set:new Set(i.filter(r=>(e.view==="all"||r.nearby||r.phase===e.view)&&(!e.placeCategories||e.placeCategories.has(r.category))).map(r=>r.id))}var Ln={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Un={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Kf=0,ih=1,Jf=2;var Xa=1,Qf=2,pi=3,Qn=0,Qt=1,Mn=2,Ot=0,Ss=1,sh=2,rh=3,ah=4,Al=5,In=100,ep=101,tp=102,np=103,ip=104,zs=200,sp=201,rp=202,ap=203,il=204,sl=205,Ya=206,op=207,$a=208,lp=209,cp=210,up=211,hp=212,dp=213,fp=214,Rl=0,Cl=1,Pl=2,ws=3,Il=4,Dl=5,Ll=6,Ul=7,oh=0,pp=1,mp=2,Bi=0,Nl=1,Fl=2,Ol=3,Dr=4,zl=5,Bl=6,kl=7,Vu="attached",gp="detached",lh=300,Bs=301,ks=302,Lr=303,Hl=304,Za=306,kt=1e3,Vn=1001,pr=1002,Ft=1003,Vl=1004;var Hs=1005;var Lt=1006,Ur=1007;var Sn=1008;var Nn=1009,ch=1010,uh=1011,Nr=1012,Gl=1013,ns=1014,cn=1015,Ut=1016,Wl=1017,jl=1018,is=1020,hh=35902,dh=35899,fh=1021,ph=1022,_n=1023,mr=1026,ss=1027,ql=1028,Xl=1029,mh=1030,Yl=1031;var $l=1033,Ka=33776,Ja=33777,Qa=33778,eo=33779,Zl=35840,Kl=35841,Jl=35842,Ql=35843,ec=36196,tc=37492,nc=37496,ic=37808,sc=37809,rc=37810,ac=37811,oc=37812,lc=37813,cc=37814,uc=37815,hc=37816,dc=37817,fc=37818,pc=37819,mc=37820,gc=37821,_c=36492,yc=36494,xc=36495,vc=36283,bc=36284,Mc=36285,Sc=36286;var Es=2300,Ts=2301,nl=2302,Gu=2400,Wu=2401,ju=2402,_p=2500;var gh=0,to=1,Fr=2,yp=3200,xp=3201;var wc=0,vp=1,Fn="",Rt="srgb",Ht="srgb-linear",ha="linear",ht="srgb";var Ms=7680;var qu=519,bp=512,Mp=513,Sp=514,_h=515,wp=516,Ep=517,Tp=518,Ap=519,rl=35044,yh=35048;var xh="300 es",Jn=2e3,da=2001;var oi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],lf=1234567,oa=Math.PI/180,As=180/Math.PI;function Gn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(rn[i&255]+rn[i>>8&255]+rn[i>>16&255]+rn[i>>24&255]+"-"+rn[e&255]+rn[e>>8&255]+"-"+rn[e>>16&15|64]+rn[e>>24&255]+"-"+rn[t&63|128]+rn[t>>8&255]+"-"+rn[t>>16&255]+rn[t>>24&255]+rn[n&255]+rn[n>>8&255]+rn[n>>16&255]+rn[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function vh(i,e){return(i%e+e)%e}function Ng(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Fg(i,e,t){return i!==e?(t-i)/(e-i):0}function la(i,e,t){return(1-t)*i+t*e}function Og(i,e,t,n){return la(i,e,1-Math.exp(-t*n))}function zg(i,e=1){return e-Math.abs(vh(i,e*2)-e)}function Bg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function kg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Hg(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Vg(i,e){return i+Math.random()*(e-i)}function Gg(i){return i*(.5-Math.random())}function Wg(i){i!==void 0&&(lf=i);let e=lf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function jg(i){return i*oa}function qg(i){return i*As}function Xg(i){return(i&i-1)===0&&i!==0}function Yg(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function $g(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Zg(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*h,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*h,o*c);break;case"ZXZ":i.set(l*h,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*f,o*u,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Kn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function pt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var ft={DEG2RAD:oa,RAD2DEG:As,generateUUID:Gn,clamp:Xe,euclideanModulo:vh,mapLinear:Ng,inverseLerp:Fg,lerp:la,damp:Og,pingpong:zg,smoothstep:Bg,smootherstep:kg,randInt:Hg,randFloat:Vg,randFloatSpread:Gg,seededRandom:Wg,degToRad:jg,radToDeg:qg,isPowerOfTwo:Xg,ceilPowerOfTwo:Yg,floorPowerOfTwo:$g,setQuaternionFromProperEuler:Zg,normalize:pt,denormalize:Kn},he=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Kt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],d=r[a+0],f=r[a+1],g=r[a+2],_=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-o,p=l*d+c*f+u*g+h*_,M=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let w=Math.sqrt(x),T=Math.atan2(w,p*M);m=Math.sin(m*T)/w,o=Math.sin(o*T)/w}let y=o*M;if(l=l*m+d*y,c=c*m+f*y,u=u*m+g*y,h=h*m+_*y,m===1-o){let w=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=w,c*=w,u*=w,h*=w}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-o*f,e[t+2]=c*g+u*f+o*d-l*h,e[t+3]=u*g-o*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>h){let f=2*Math.sqrt(1+n-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){let f=2*Math.sqrt(1+o-n-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let l=1-o*o;if(l<=Number.EPSILON){let f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return du.copy(this).projectOnVector(e),this.sub(du)}reflect(e){return this.sub(du.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},du=new C,cf=new Kt,Ye=class i{constructor(e,t,n,s,r,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=s[0],m=s[3],p=s[6],M=s[1],x=s[4],y=s[7],w=s[2],T=s[5],P=s[8];return r[0]=a*_+o*M+l*w,r[3]=a*m+o*x+l*T,r[6]=a*p+o*y+l*P,r[1]=c*_+u*M+h*w,r[4]=c*m+u*x+h*T,r[7]=c*p+u*y+h*P,r[2]=d*_+f*M+g*w,r[5]=d*m+f*x+g*T,r[8]=d*p+f*y+g*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(s*c-u*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(fu.makeScale(e,t)),this}rotate(e){return this.premultiply(fu.makeRotation(-e)),this}translate(e,t){return this.premultiply(fu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},fu=new Ye;function bh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Rp(){let i=gr("canvas");return i.style.display="block",i}var uf={};function _r(i){i in uf||(uf[i]=!0,console.warn(i))}function Cp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var hf=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),df=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kg(){let i={enabled:!0,workingColorSpace:Ht,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ht&&(s.r=Ii(s.r),s.g=Ii(s.g),s.b=Ii(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ht&&(s.r=dr(s.r),s.g=dr(s.g),s.b=dr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Fn?ha:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return _r("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return _r("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ht]:{primaries:e,whitePoint:n,transfer:ha,toXYZ:hf,fromXYZ:df,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Rt},outputColorSpaceConfig:{drawingBufferColorSpace:Rt}},[Rt]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:hf,fromXYZ:df,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Rt}}}),i}var Je=Kg();function Ii(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function dr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Js,al=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Js===void 0&&(Js=gr("canvas")),Js.width=e.width,Js.height=e.height;let s=Js.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Js}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=gr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ii(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ii(t[n]/255)*255):t[n]=Ii(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Jg=0,yr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Jg++}),this.uuid=Gn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(pu(s[a].image)):r.push(pu(s[a]))}else r=pu(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function pu(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?al.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Qg=0,mu=new C,$t=class i extends oi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Vn,s=Vn,r=Lt,a=Sn,o=_n,l=Nn,c=i.DEFAULT_ANISOTROPY,u=Fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qg++}),this.uuid=Gn(),this.name="",this.source=new yr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(mu).x}get height(){return this.source.getSize(mu).y}get depth(){return this.source.getSize(mu).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==lh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kt:e.x=e.x-Math.floor(e.x);break;case Vn:e.x=e.x<0?0:1;break;case pr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case kt:e.y=e.y-Math.floor(e.y);break;case Vn:e.y=e.y<0?0:1;break;case pr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=lh;$t.DEFAULT_ANISOTROPY=1;var nt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,y=(f+1)/2,w=(p+1)/2,T=(u+d)/4,P=(h+_)/4,A=(g+m)/4;return x>y&&x>w?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=T/n,r=P/n):y>w?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=T/s,r=A/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=P/r,s=A/r),this.set(n,s,r,t),this}let M=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(h-_)/M,this.z=(d-u)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ol=class extends oi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Lt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new nt(0,0,e,t),this.scissorTest=!1,this.viewport=new nt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new $t(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:Lt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new yr(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vt=class extends ol{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},fa=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ll=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Gt=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Yn):Yn.fromBufferAttribute(r,a),Yn.applyMatrix4(e.matrixWorld),this.expandByPoint(Yn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Co.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Co.copy(n.boundingBox)),Co.applyMatrix4(e.matrixWorld),this.union(Co)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Yn),Yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Jr),Po.subVectors(this.max,Jr),Qs.subVectors(e.a,Jr),er.subVectors(e.b,Jr),tr.subVectors(e.c,Jr),ji.subVectors(er,Qs),qi.subVectors(tr,er),ys.subVectors(Qs,tr);let t=[0,-ji.z,ji.y,0,-qi.z,qi.y,0,-ys.z,ys.y,ji.z,0,-ji.x,qi.z,0,-qi.x,ys.z,0,-ys.x,-ji.y,ji.x,0,-qi.y,qi.x,0,-ys.y,ys.x,0];return!gu(t,Qs,er,tr,Po)||(t=[1,0,0,0,1,0,0,0,1],!gu(t,Qs,er,tr,Po))?!1:(Io.crossVectors(ji,qi),t=[Io.x,Io.y,Io.z],gu(t,Qs,er,tr,Po))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(wi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),wi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),wi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),wi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),wi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),wi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),wi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),wi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(wi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},wi=[new C,new C,new C,new C,new C,new C,new C,new C],Yn=new C,Co=new Gt,Qs=new C,er=new C,tr=new C,ji=new C,qi=new C,ys=new C,Jr=new C,Po=new C,Io=new C,xs=new C;function gu(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){xs.fromArray(i,r);let o=s.x*Math.abs(xs.x)+s.y*Math.abs(xs.y)+s.z*Math.abs(xs.z),l=e.dot(xs),c=t.dot(xs),u=n.dot(xs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var e0=new Gt,Qr=new C,_u=new C,vn=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):e0.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Qr.subVectors(e,this.center);let t=Qr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Qr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_u.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Qr.copy(e.center).add(_u)),this.expandByPoint(Qr.copy(e.center).sub(_u))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ei=new C,yu=new C,Do=new C,Xi=new C,xu=new C,Lo=new C,vu=new C,li=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ei.copy(this.origin).addScaledVector(this.direction,t),Ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){yu.copy(e).add(t).multiplyScalar(.5),Do.copy(t).sub(e).normalize(),Xi.copy(this.origin).sub(yu);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Do),o=Xi.dot(this.direction),l=-Xi.dot(Do),c=Xi.lengthSq(),u=Math.abs(1-a*a),h,d,f,g;if(u>0)if(h=a*l-o,d=a*o-l,g=r*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(yu).addScaledVector(Do,d),f}intersectSphere(e,t){Ei.subVectors(e.center,this.origin);let n=Ei.dot(this.direction),s=Ei.dot(Ei)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ei)!==null}intersectTriangle(e,t,n,s,r){xu.subVectors(t,e),Lo.subVectors(n,e),vu.crossVectors(xu,Lo);let a=this.direction.dot(vu),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Xi.subVectors(this.origin,e);let l=o*this.direction.dot(Lo.crossVectors(Xi,Lo));if(l<0)return null;let c=o*this.direction.dot(xu.cross(Xi));if(c<0||l+c>a)return null;let u=-o*Xi.dot(vu);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ce=class i{constructor(e,t,n,s,r,a,o,l,c,u,h,d,f,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,_,m)}set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/nr.setFromMatrixColumn(e,0).length(),r=1/nr.setFromMatrixColumn(e,1).length(),a=1/nr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=a*u,f=a*h,g=o*u,_=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d+_*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-g,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d-_*o,t[4]=-a*h,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*u,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*u,f=a*h,g=o*u,_=o*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,f=a*c,g=o*l,_=o*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){let d=a*l,f=a*c,g=o*l,_=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=a*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=o*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(t0,e,n0)}lookAt(e,t,n){let s=this.elements;return Cn.subVectors(e,t),Cn.lengthSq()===0&&(Cn.z=1),Cn.normalize(),Yi.crossVectors(n,Cn),Yi.lengthSq()===0&&(Math.abs(n.z)===1?Cn.x+=1e-4:Cn.z+=1e-4,Cn.normalize(),Yi.crossVectors(n,Cn)),Yi.normalize(),Uo.crossVectors(Cn,Yi),s[0]=Yi.x,s[4]=Uo.x,s[8]=Cn.x,s[1]=Yi.y,s[5]=Uo.y,s[9]=Cn.y,s[2]=Yi.z,s[6]=Uo.z,s[10]=Cn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],M=n[3],x=n[7],y=n[11],w=n[15],T=s[0],P=s[4],A=s[8],S=s[12],b=s[1],R=s[5],L=s[9],F=s[13],z=s[2],V=s[6],B=s[10],ne=s[14],G=s[3],le=s[7],ce=s[11],Me=s[15];return r[0]=a*T+o*b+l*z+c*G,r[4]=a*P+o*R+l*V+c*le,r[8]=a*A+o*L+l*B+c*ce,r[12]=a*S+o*F+l*ne+c*Me,r[1]=u*T+h*b+d*z+f*G,r[5]=u*P+h*R+d*V+f*le,r[9]=u*A+h*L+d*B+f*ce,r[13]=u*S+h*F+d*ne+f*Me,r[2]=g*T+_*b+m*z+p*G,r[6]=g*P+_*R+m*V+p*le,r[10]=g*A+_*L+m*B+p*ce,r[14]=g*S+_*F+m*ne+p*Me,r[3]=M*T+x*b+y*z+w*G,r[7]=M*P+x*R+y*V+w*le,r[11]=M*A+x*L+y*B+w*ce,r[15]=M*S+x*F+y*ne+w*Me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+r*l*h-s*c*h-r*o*d+n*c*d+s*o*f-n*l*f)+_*(+t*l*f-t*c*d+r*a*d-s*a*f+s*c*u-r*l*u)+m*(+t*c*h-t*o*f-r*a*h+n*a*f+r*o*u-n*c*u)+p*(-s*o*u-t*l*h+t*o*d+s*a*h-n*a*d+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],M=h*m*c-_*d*c+_*l*f-o*m*f-h*l*p+o*d*p,x=g*d*c-u*m*c-g*l*f+a*m*f+u*l*p-a*d*p,y=u*_*c-g*h*c+g*o*f-a*_*f-u*o*p+a*h*p,w=g*h*l-u*_*l-g*o*d+a*_*d+u*o*m-a*h*m,T=t*M+n*x+s*y+r*w;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let P=1/T;return e[0]=M*P,e[1]=(_*d*r-h*m*r-_*s*f+n*m*f+h*s*p-n*d*p)*P,e[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*p+n*l*p)*P,e[3]=(h*l*r-o*d*r-h*s*c+n*d*c+o*s*f-n*l*f)*P,e[4]=x*P,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*P,e[6]=(g*l*r-a*m*r-g*s*c+t*m*c+a*s*p-t*l*p)*P,e[7]=(a*d*r-u*l*r+u*s*c-t*d*c-a*s*f+t*l*f)*P,e[8]=y*P,e[9]=(g*h*r-u*_*r-g*n*f+t*_*f+u*n*p-t*h*p)*P,e[10]=(a*_*r-g*o*r+g*n*c-t*_*c-a*n*p+t*o*p)*P,e[11]=(u*o*r-a*h*r-u*n*c+t*h*c+a*n*f-t*o*f)*P,e[12]=w*P,e[13]=(u*_*s-g*h*s+g*n*d-t*_*d-u*n*m+t*h*m)*P,e[14]=(g*o*s-a*_*s-g*n*l+t*_*l+a*n*m-t*o*m)*P,e[15]=(a*h*s-u*o*s+u*n*l-t*h*l-a*n*d+t*o*d)*P,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,g=r*h,_=a*u,m=a*h,p=o*h,M=l*c,x=l*u,y=l*h,w=n.x,T=n.y,P=n.z;return s[0]=(1-(_+p))*w,s[1]=(f+y)*w,s[2]=(g-x)*w,s[3]=0,s[4]=(f-y)*T,s[5]=(1-(d+p))*T,s[6]=(m+M)*T,s[7]=0,s[8]=(g+x)*P,s[9]=(m-M)*P,s[10]=(1-(d+_))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=nr.set(s[0],s[1],s[2]).length(),a=nr.set(s[4],s[5],s[6]).length(),o=nr.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],$n.copy(this);let c=1/r,u=1/a,h=1/o;return $n.elements[0]*=c,$n.elements[1]*=c,$n.elements[2]*=c,$n.elements[4]*=u,$n.elements[5]*=u,$n.elements[6]*=u,$n.elements[8]*=h,$n.elements[9]*=h,$n.elements[10]*=h,t.setFromRotationMatrix($n),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=Jn,l=!1){let c=this.elements,u=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===Jn)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===da)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Jn,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===Jn)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===da)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},nr=new C,$n=new Ce,t0=new C(0,0,0),n0=new C(1,1,1),Yi=new C,Uo=new C,Cn=new C,ff=new Ce,pf=new Kt,ei=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ff.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ff,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return pf.setFromEuler(this),this.setFromQuaternion(pf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ei.DEFAULT_ORDER="XYZ";var xr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},i0=0,mf=new C,ir=new Kt,Ti=new Ce,No=new C,ea=new C,s0=new C,r0=new Kt,gf=new C(1,0,0),_f=new C(0,1,0),yf=new C(0,0,1),xf={type:"added"},a0={type:"removed"},sr={type:"childadded",child:null},bu={type:"childremoved",child:null},Et=class i extends oi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:i0++}),this.uuid=Gn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new C,t=new ei,n=new Kt,s=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ce},normalMatrix:{value:new Ye}}),this.matrix=new Ce,this.matrixWorld=new Ce,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ir.setFromAxisAngle(e,t),this.quaternion.multiply(ir),this}rotateOnWorldAxis(e,t){return ir.setFromAxisAngle(e,t),this.quaternion.premultiply(ir),this}rotateX(e){return this.rotateOnAxis(gf,e)}rotateY(e){return this.rotateOnAxis(_f,e)}rotateZ(e){return this.rotateOnAxis(yf,e)}translateOnAxis(e,t){return mf.copy(e).applyQuaternion(this.quaternion),this.position.add(mf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gf,e)}translateY(e){return this.translateOnAxis(_f,e)}translateZ(e){return this.translateOnAxis(yf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ti.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?No.copy(e):No.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ea.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ti.lookAt(ea,No,this.up):Ti.lookAt(No,ea,this.up),this.quaternion.setFromRotationMatrix(Ti),s&&(Ti.extractRotation(s.matrixWorld),ir.setFromRotationMatrix(Ti),this.quaternion.premultiply(ir.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xf),sr.child=e,this.dispatchEvent(sr),sr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(a0),bu.child=e,this.dispatchEvent(bu),bu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ti),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xf),sr.child=e,this.dispatchEvent(sr),sr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ea,e,s0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ea,r0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Et.DEFAULT_UP=new C(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Zn=new C,Ai=new C,Mu=new C,Ri=new C,rr=new C,ar=new C,vf=new C,Su=new C,wu=new C,Eu=new C,Tu=new nt,Au=new nt,Ru=new nt,Ki=class i{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Zn.subVectors(e,t),s.cross(Zn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Zn.subVectors(s,t),Ai.subVectors(n,t),Mu.subVectors(e,t);let a=Zn.dot(Zn),o=Zn.dot(Ai),l=Zn.dot(Mu),c=Ai.dot(Ai),u=Ai.dot(Mu),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(c*l-o*u)*d,g=(a*u-o*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ri)===null?!1:Ri.x>=0&&Ri.y>=0&&Ri.x+Ri.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ri)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ri.x),l.addScaledVector(a,Ri.y),l.addScaledVector(o,Ri.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Tu.setScalar(0),Au.setScalar(0),Ru.setScalar(0),Tu.fromBufferAttribute(e,t),Au.fromBufferAttribute(e,n),Ru.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Tu,r.x),a.addScaledVector(Au,r.y),a.addScaledVector(Ru,r.z),a}static isFrontFacing(e,t,n,s){return Zn.subVectors(n,t),Ai.subVectors(e,t),Zn.cross(Ai).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Zn.subVectors(this.c,this.b),Ai.subVectors(this.a,this.b),Zn.cross(Ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;rr.subVectors(s,n),ar.subVectors(r,n),Su.subVectors(e,n);let l=rr.dot(Su),c=ar.dot(Su);if(l<=0&&c<=0)return t.copy(n);wu.subVectors(e,s);let u=rr.dot(wu),h=ar.dot(wu);if(u>=0&&h<=u)return t.copy(s);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(rr,a);Eu.subVectors(e,r);let f=rr.dot(Eu),g=ar.dot(Eu);if(g>=0&&f<=g)return t.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(ar,o);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return vf.subVectors(r,s),o=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(vf,o);let p=1/(m+_+d);return a=_*p,o=d*p,t.copy(n).addScaledVector(rr,a).addScaledVector(ar,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Pp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$i={h:0,s:0,l:0},Fo={h:0,s:0,l:0};function Cu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var De=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Rt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Je.workingColorSpace){if(e=vh(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Cu(a,r,e+1/3),this.g=Cu(a,r,e),this.b=Cu(a,r,e-1/3)}return Je.colorSpaceToWorking(this,s),this}setStyle(e,t=Rt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Rt){let n=Pp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ii(e.r),this.g=Ii(e.g),this.b=Ii(e.b),this}copyLinearToSRGB(e){return this.r=dr(e.r),this.g=dr(e.g),this.b=dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Rt){return Je.workingToColorSpace(an.copy(this),e),Math.round(Xe(an.r*255,0,255))*65536+Math.round(Xe(an.g*255,0,255))*256+Math.round(Xe(an.b*255,0,255))}getHexString(e=Rt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(an.copy(this),t);let n=an.r,s=an.g,r=an.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(an.copy(this),t),e.r=an.r,e.g=an.g,e.b=an.b,e}getStyle(e=Rt){Je.workingToColorSpace(an.copy(this),e);let t=an.r,n=an.g,s=an.b;return e!==Rt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL($i),this.setHSL($i.h+e,$i.s+t,$i.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL($i),e.getHSL(Fo);let n=la($i.h,Fo.h,t),s=la($i.s,Fo.s,t),r=la($i.l,Fo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},an=new De;De.NAMES=Pp;var o0=0,gn=class extends oi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:o0++}),this.uuid=Gn(),this.name="",this.type="Material",this.blending=Ss,this.side=Qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=il,this.blendDst=sl,this.blendEquation=In,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=ws,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ms,this.stencilZFail=Ms,this.stencilZPass=Ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ss&&(n.blending=this.blending),this.side!==Qn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==il&&(n.blendSrc=this.blendSrc),this.blendDst!==sl&&(n.blendDst=this.blendDst),this.blendEquation!==In&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ws&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==qu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ms&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ms&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ms&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Jt=class extends gn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.combine=oh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Pi=l0();function l0(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,s[l]=24,s[l|256]=24):(n[l]=31744,n[l|256]=64512,s[l]=13,s[l|256]=13)}let r=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,u=0;for(;(c&8388608)===0;)c<<=1,u-=8388608;c&=-8388609,u+=947912704,r[l]=c|u}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:s,mantissaTable:r,exponentTable:a,offsetTable:o}}function c0(i){Math.abs(i)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),i=Xe(i,-65504,65504),Pi.floatView[0]=i;let e=Pi.uint32View[0],t=e>>23&511;return Pi.baseTable[t]+((e&8388607)>>Pi.shiftTable[t])}function u0(i){let e=i>>10;return Pi.uint32View[0]=Pi.mantissaTable[Pi.offsetTable[e]+(i&1023)]+Pi.exponentTable[e],Pi.floatView[0]}var Ji=class{static toHalfFloat(e){return c0(e)}static fromHalfFloat(e){return u0(e)}},Nt=new C,Oo=new he,h0=0,ct=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:h0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=rl,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Oo.fromBufferAttribute(this,t),Oo.applyMatrix3(e),this.setXY(t,Oo.x,Oo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix3(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix4(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyNormalMatrix(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.transformDirection(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Kn(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Kn(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Kn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Kn(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),s=pt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),s=pt(s,this.array),r=pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==rl&&(e.usage=this.usage),e}};var pa=class extends ct{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ma=class extends ct{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var ut=class extends ct{constructor(e,t,n){super(new Float32Array(e),t,n)}},d0=0,Hn=new Ce,Pu=new Et,or=new C,Pn=new Gt,ta=new Gt,Yt=new C,gt=class i extends oi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:d0++}),this.uuid=Gn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(bh(e)?ma:pa)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Hn.makeRotationFromQuaternion(e),this.applyMatrix4(Hn),this}rotateX(e){return Hn.makeRotationX(e),this.applyMatrix4(Hn),this}rotateY(e){return Hn.makeRotationY(e),this.applyMatrix4(Hn),this}rotateZ(e){return Hn.makeRotationZ(e),this.applyMatrix4(Hn),this}translate(e,t,n){return Hn.makeTranslation(e,t,n),this.applyMatrix4(Hn),this}scale(e,t,n){return Hn.makeScale(e,t,n),this.applyMatrix4(Hn),this}lookAt(e){return Pu.lookAt(e),Pu.updateMatrix(),this.applyMatrix4(Pu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(or).negate(),this.translate(or.x,or.y,or.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ut(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Pn.setFromBufferAttribute(r),this.morphTargetsRelative?(Yt.addVectors(this.boundingBox.min,Pn.min),this.boundingBox.expandByPoint(Yt),Yt.addVectors(this.boundingBox.max,Pn.max),this.boundingBox.expandByPoint(Yt)):(this.boundingBox.expandByPoint(Pn.min),this.boundingBox.expandByPoint(Pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let n=this.boundingSphere.center;if(Pn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];ta.setFromBufferAttribute(o),this.morphTargetsRelative?(Yt.addVectors(Pn.min,ta.min),Pn.expandByPoint(Yt),Yt.addVectors(Pn.max,ta.max),Pn.expandByPoint(Yt)):(Pn.expandByPoint(ta.min),Pn.expandByPoint(ta.max))}Pn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Yt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Yt.fromBufferAttribute(o,c),l&&(or.fromBufferAttribute(e,c),Yt.add(or)),s=Math.max(s,n.distanceToSquared(Yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ct(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let A=0;A<n.count;A++)o[A]=new C,l[A]=new C;let c=new C,u=new C,h=new C,d=new he,f=new he,g=new he,_=new C,m=new C;function p(A,S,b){c.fromBufferAttribute(n,A),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,b),d.fromBufferAttribute(r,A),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,b),u.sub(c),h.sub(c),f.sub(d),g.sub(d);let R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(R),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(R),o[A].add(_),o[S].add(_),o[b].add(_),l[A].add(m),l[S].add(m),l[b].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let A=0,S=M.length;A<S;++A){let b=M[A],R=b.start,L=b.count;for(let F=R,z=R+L;F<z;F+=3)p(e.getX(F+0),e.getX(F+1),e.getX(F+2))}let x=new C,y=new C,w=new C,T=new C;function P(A){w.fromBufferAttribute(s,A),T.copy(w);let S=o[A];x.copy(S),x.sub(w.multiplyScalar(w.dot(S))).normalize(),y.crossVectors(T,S);let R=y.dot(l[A])<0?-1:1;a.setXYZW(A,x.x,x.y,x.z,R)}for(let A=0,S=M.length;A<S;++A){let b=M[A],R=b.start,L=b.count;for(let F=R,z=R+L;F<z;F+=3)P(e.getX(F+0)),P(e.getX(F+1)),P(e.getX(F+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ct(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,u=new C,h=new C;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Yt.fromBufferAttribute(e,t),Yt.normalize(),e.setXYZ(t,Yt.x,Yt.y,Yt.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new ct(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},bf=new Ce,vs=new li,zo=new vn,Mf=new C,Bo=new C,ko=new C,Ho=new C,Iu=new C,Vo=new C,Sf=new C,Go=new C,it=class extends Et{constructor(e=new gt,t=new Jt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Vo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],h=r[l];u!==0&&(Iu.fromBufferAttribute(h,e),a?Vo.addScaledVector(Iu,u):Vo.addScaledVector(Iu.sub(t),u))}t.add(Vo)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),zo.copy(n.boundingSphere),zo.applyMatrix4(r),vs.copy(e.ray).recast(e.near),!(zo.containsPoint(vs.origin)===!1&&(vs.intersectSphere(zo,Mf)===null||vs.origin.distanceToSquared(Mf)>(e.far-e.near)**2))&&(bf.copy(r).invert(),vs.copy(e.ray).applyMatrix4(bf),!(n.boundingBox!==null&&vs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,vs)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),x=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let y=M,w=x;y<w;y+=3){let T=o.getX(y),P=o.getX(y+1),A=o.getX(y+2);s=Wo(this,p,e,n,c,u,h,T,P,A),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let M=o.getX(m),x=o.getX(m+1),y=o.getX(m+2);s=Wo(this,a,e,n,c,u,h,M,x,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),x=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=M,w=x;y<w;y+=3){let T=y,P=y+1,A=y+2;s=Wo(this,p,e,n,c,u,h,T,P,A),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let M=m,x=m+1,y=m+2;s=Wo(this,a,e,n,c,u,h,M,x,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function f0(i,e,t,n,s,r,a,o){let l;if(e.side===Qt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Qn,o),l===null)return null;Go.copy(o),Go.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Go);return c<t.near||c>t.far?null:{distance:c,point:Go.clone(),object:i}}function Wo(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Bo),i.getVertexPosition(l,ko),i.getVertexPosition(c,Ho);let u=f0(i,e,t,n,Bo,ko,Ho,Sf);if(u){let h=new C;Ki.getBarycoord(Sf,Bo,ko,Ho,h),s&&(u.uv=Ki.getInterpolatedAttribute(s,o,l,c,h,new he)),r&&(u.uv1=Ki.getInterpolatedAttribute(r,o,l,c,h,new he)),a&&(u.normal=Ki.getInterpolatedAttribute(a,o,l,c,h,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new C,materialIndex:0};Ki.getNormal(Bo,ko,Ho,d.normal),u.face=d,u.barycoord=h}return u}var Qi=class i extends gt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(h,2));function g(_,m,p,M,x,y,w,T,P,A,S){let b=y/P,R=w/A,L=y/2,F=w/2,z=T/2,V=P+1,B=A+1,ne=0,G=0,le=new C;for(let ce=0;ce<B;ce++){let Me=ce*R-F;for(let Re=0;Re<V;Re++){let Fe=Re*b-L;le[_]=Fe*M,le[m]=Me*x,le[p]=z,c.push(le.x,le.y,le.z),le[_]=0,le[m]=0,le[p]=T>0?1:-1,u.push(le.x,le.y,le.z),h.push(Re/P),h.push(1-ce/A),ne+=1}}for(let ce=0;ce<A;ce++)for(let Me=0;Me<P;Me++){let Re=d+Me+V*ce,Fe=d+Me+V*(ce+1),Ve=d+(Me+1)+V*(ce+1),pe=d+(Me+1)+V*ce;l.push(Re,Fe,pe),l.push(Fe,Ve,pe),G+=6}o.addGroup(f,G,S),f+=G,d+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Vs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function un(i){let e={};for(let t=0;t<i.length;t++){let n=Vs(i[t]);for(let s in n)e[s]=n[s]}return e}function p0(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Mh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var hn={clone:Vs,merge:un},m0=`void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,g0=`void main() {
  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,St=class extends gn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=m0,this.fragmentShader=g0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Vs(e.uniforms),this.uniformsGroups=p0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ga=class extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ce,this.projectionMatrix=new Ce,this.projectionMatrixInverse=new Ce,this.coordinateSystem=Jn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Zi=new C,wf=new he,Ef=new he,Dt=class extends ga{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=As*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(oa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return As*2*Math.atan(Math.tan(oa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z),Zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z)}getViewSize(e,t){return this.getViewBounds(e,wf,Ef),t.subVectors(Ef,wf)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(oa*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},lr=-90,cr=1,vr=class extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Dt(lr,cr,e,t);s.layers=this.layers,this.add(s);let r=new Dt(lr,cr,e,t);r.layers=this.layers,this.add(r);let a=new Dt(lr,cr,e,t);a.layers=this.layers,this.add(a);let o=new Dt(lr,cr,e,t);o.layers=this.layers,this.add(o);let l=new Dt(lr,cr,e,t);l.layers=this.layers,this.add(l);let c=new Dt(lr,cr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Jn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===da)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},_a=class extends $t{constructor(e=[],t=Bs,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},br=class extends Vt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new _a(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

        varying vec3 vWorldDirection;

        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

        }

        void main() {

          vWorldDirection = transformDirection( position, modelMatrix );

          #include <begin_vertex>
          #include <project_vertex>

        }
      `,fragmentShader:`

        uniform sampler2D tEquirect;

        varying vec3 vWorldDirection;

        #include <common>

        void main() {

          vec3 direction = normalize( vWorldDirection );

          vec2 sampleUV = equirectUv( direction );

          gl_FragColor = texture2D( tEquirect, sampleUV );

        }
      `},s=new Qi(5,5,5),r=new St({name:"CubemapFromEquirect",uniforms:Vs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qt,blending:Ot});r.uniforms.tEquirect.value=t;let a=new it(s,r),o=t.minFilter;return t.minFilter===Sn&&(t.minFilter=Lt),new vr(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},Bt=class extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}},_0={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Bt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Bt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Bt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_0)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Bt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Sr=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new De(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Rs=class extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ei,this.environmentIntensity=1,this.environmentRotation=new ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},wr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=rl,this.updateRanges=[],this.version=0,this.uuid=Gn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},mn=new C,Er=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyMatrix4(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyNormalMatrix(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.transformDirection(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Kn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Kn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Kn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Kn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),s=pt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),s=pt(s,this.array),r=pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new ct(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var Tf=new C,Af=new nt,Rf=new nt,y0=new C,Cf=new Ce,jo=new C,Du=new vn,Pf=new Ce,Lu=new li,ya=class extends it{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Vu,this.bindMatrix=new Ce,this.bindMatrixInverse=new Ce,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Gt),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,jo),this.boundingBox.expandByPoint(jo)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,jo),this.boundingSphere.expandByPoint(jo)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Du.copy(this.boundingSphere),Du.applyMatrix4(s),e.ray.intersectsSphere(Du)!==!1&&(Pf.copy(s).invert(),Lu.copy(e.ray).applyMatrix4(Pf),!(this.boundingBox!==null&&Lu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Lu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new nt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Vu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===gp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Af.fromBufferAttribute(s.attributes.skinIndex,e),Rf.fromBufferAttribute(s.attributes.skinWeight,e),Tf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let a=Rf.getComponent(r);if(a!==0){let o=Af.getComponent(r);Cf.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(y0.copy(Tf).applyMatrix4(Cf),a)}}return t.applyMatrix4(this.bindMatrixInverse)}},Tr=class extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}},ci=class extends $t{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ft,u=Ft,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},If=new Ce,x0=new Ce,xa=class i{constructor(e=[],t=[]){this.uuid=Gn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Ce)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ce;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:x0;If.multiplyMatrices(o,t[r]),If.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ci(t,e,e,_n,cn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new Tr),this.bones.push(a),this.boneInverses.push(new Ce().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},es=class extends ct{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ur=new Ce,Df=new Ce,qo=[],Lf=new Gt,v0=new Ce,na=new it,ia=new vn,va=class extends it{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new es(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,v0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Gt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),Lf.copy(e.boundingBox).applyMatrix4(ur),this.boundingBox.union(Lf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),ia.copy(e.boundingSphere).applyMatrix4(ur),this.boundingSphere.union(ia)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(na.geometry=this.geometry,na.material=this.material,na.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ia.copy(this.boundingSphere),ia.applyMatrix4(n),e.ray.intersectsSphere(ia)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ur),Df.multiplyMatrices(n,ur),na.matrixWorld=Df,na.raycast(e,qo);for(let a=0,o=qo.length;a<o;a++){let l=qo[a];l.instanceId=r,l.object=this,t.push(l)}qo.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new es(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ci(new Float32Array(s*this.count),s,this.count,ql,cn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Uu=new C,b0=new C,M0=new Ye,on=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Uu.subVectors(n,t).cross(b0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Uu),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||M0.getNormalMatrix(e),s=this.coplanarPoint(Uu).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},bs=new vn,S0=new he(.5,.5),Xo=new C,ts=class{constructor(e=new on,t=new on,n=new on,s=new on,r=new on,a=new on){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Jn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],M=r[12],x=r[13],y=r[14],w=r[15];if(s[0].setComponents(c-a,f-u,p-g,w-M).normalize(),s[1].setComponents(c+a,f+u,p+g,w+M).normalize(),s[2].setComponents(c+o,f+h,p+_,w+x).normalize(),s[3].setComponents(c-o,f-h,p-_,w-x).normalize(),n)s[4].setComponents(l,d,m,y).normalize(),s[5].setComponents(c-l,f-d,p-m,w-y).normalize();else if(s[4].setComponents(c-l,f-d,p-m,w-y).normalize(),t===Jn)s[5].setComponents(c+l,f+d,p+m,w+y).normalize();else if(t===da)s[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),bs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),bs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(bs)}intersectsSprite(e){bs.center.set(0,0,0);let t=S0.distanceTo(e.center);return bs.radius=.7071067811865476+t,bs.applyMatrix4(e.matrixWorld),this.intersectsSphere(bs)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Xo.x=s.normal.x>0?e.max.x:e.min.x,Xo.y=s.normal.y>0?e.max.y:e.min.y,Xo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Xo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ui=class extends gn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new De(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},cl=new C,ul=new C,Uf=new Ce,sa=new li,Yo=new vn,Nu=new C,Nf=new C,Cs=class extends Et{constructor(e=new gt,t=new ui){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)cl.fromBufferAttribute(t,s-1),ul.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=cl.distanceTo(ul);e.setAttribute("lineDistance",new ut(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Yo.copy(n.boundingSphere),Yo.applyMatrix4(s),Yo.radius+=r,e.ray.intersectsSphere(Yo)===!1)return;Uf.copy(s).invert(),sa.copy(e.ray).applyMatrix4(Uf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let _=f,m=g-1;_<m;_+=c){let p=u.getX(_),M=u.getX(_+1),x=$o(this,e,sa,l,p,M,_);x&&t.push(x)}if(this.isLineLoop){let _=u.getX(g-1),m=u.getX(f),p=$o(this,e,sa,l,_,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=f,m=g-1;_<m;_+=c){let p=$o(this,e,sa,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){let _=$o(this,e,sa,l,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function $o(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(cl.fromBufferAttribute(o,s),ul.fromBufferAttribute(o,r),t.distanceSqToSegment(cl,ul,Nu,Nf)>n)return;Nu.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Nu);if(!(c<e.near||c>e.far))return{distance:c,point:Nf.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Ff=new C,Of=new C,Di=class extends Cs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Ff.fromBufferAttribute(t,s),Of.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ff.distanceTo(Of);e.setAttribute("lineDistance",new ut(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},ba=class extends Cs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Ar=class extends gn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new De(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},zf=new Ce,Xu=new li,Zo=new vn,Ko=new C,Ma=class extends Et{constructor(e=new gt,t=new Ar){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Zo.copy(n.boundingSphere),Zo.applyMatrix4(s),Zo.radius+=r,e.ray.intersectsSphere(Zo)===!1)return;zf.copy(s).invert(),Xu.copy(e.ray).applyMatrix4(zf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let g=d,_=f;g<_;g++){let m=c.getX(g);Ko.fromBufferAttribute(h,m),Bf(Ko,m,l,s,e,t,this)}}else{let d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let g=d,_=f;g<_;g++)Ko.fromBufferAttribute(h,g),Bf(Ko,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Bf(i,e,t,n,s,r,a){let o=Xu.distanceSqToPoint(i);if(o<t){let l=new C;Xu.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Ps=class extends $t{constructor(e,t,n=ns,s,r,a,o=Ft,l=Ft,c,u=mr,h=1){if(u!==mr&&u!==ss)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Sa=class extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var hl=class i extends gt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],g=0,_=[],m=n/2,p=0;M(),a===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new ut(h,3)),this.setAttribute("normal",new ut(d,3)),this.setAttribute("uv",new ut(f,2));function M(){let y=new C,w=new C,T=0,P=(t-e)/n;for(let A=0;A<=r;A++){let S=[],b=A/r,R=b*(t-e)+e;for(let L=0;L<=s;L++){let F=L/s,z=F*l+o,V=Math.sin(z),B=Math.cos(z);w.x=R*V,w.y=-b*n+m,w.z=R*B,h.push(w.x,w.y,w.z),y.set(V,P,B).normalize(),d.push(y.x,y.y,y.z),f.push(F,1-b),S.push(g++)}_.push(S)}for(let A=0;A<s;A++)for(let S=0;S<r;S++){let b=_[S][A],R=_[S+1][A],L=_[S+1][A+1],F=_[S][A+1];(e>0||S!==0)&&(u.push(b,R,F),T+=3),(t>0||S!==r-1)&&(u.push(R,L,F),T+=3)}c.addGroup(p,T,0),p+=T}function x(y){let w=g,T=new he,P=new C,A=0,S=y===!0?e:t,b=y===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,m*b,0),d.push(0,b,0),f.push(.5,.5),g++;let R=g;for(let L=0;L<=s;L++){let z=L/s*l+o,V=Math.cos(z),B=Math.sin(z);P.x=S*B,P.y=m*b,P.z=S*V,h.push(P.x,P.y,P.z),d.push(0,b,0),T.x=V*.5+.5,T.y=B*.5*b+.5,f.push(T.x,T.y),g++}for(let L=0;L<s;L++){let F=w+L,z=R+L;y===!0?u.push(z,z+1,F):u.push(z+1,z,F),A+=3}c.addGroup(p,A,y===!0?1:2),p+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},wa=class i extends hl{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Dn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let u=n[s],d=n[s+1]-u,f=(a-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new he:new C);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new C,s=[],r=[],a=[],o=new C,l=new Ce;for(let f=0;f<=e;f++){let g=f/e;s[f]=this.getTangentAt(g,new C)}r[0]=new C,a[0]=new C;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Xe(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,g))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Xe(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Rr=class extends Dn{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new he){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},dl=class extends Rr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Sh(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,h){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+h)+(l-o)/h;d*=u,f*=u,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var Jo=new C,Fu=new Sh,Ou=new Sh,zu=new Sh,fl=class extends Dn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new C){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(Jo.subVectors(s[0],s[1]).add(s[0]),c=Jo);let h=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Jo.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Jo),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),f),_=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Fu.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,_,m),Ou.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,_,m),zu.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(Fu.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Ou.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),zu.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Fu.calc(l),Ou.calc(l),zu.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new C().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function kf(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function w0(i,e){let t=1-i;return t*t*e}function E0(i,e){return 2*(1-i)*i*e}function T0(i,e){return i*i*e}function ca(i,e,t,n){return w0(i,e)+E0(i,t)+T0(i,n)}function A0(i,e){let t=1-i;return t*t*t*e}function R0(i,e){let t=1-i;return 3*t*t*i*e}function C0(i,e){return 3*(1-i)*i*i*e}function P0(i,e){return i*i*i*e}function ua(i,e,t,n,s){return A0(i,e)+R0(i,t)+C0(i,n)+P0(i,s)}var Ea=class extends Dn{constructor(e=new he,t=new he,n=new he,s=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new he){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ua(e,s.x,r.x,a.x,o.x),ua(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},pl=class extends Dn{constructor(e=new C,t=new C,n=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new C){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ua(e,s.x,r.x,a.x,o.x),ua(e,s.y,r.y,a.y,o.y),ua(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ta=class extends Dn{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ml=class extends Dn{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Aa=class extends Dn{constructor(e=new he,t=new he,n=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new he){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ca(e,s.x,r.x,a.x),ca(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},gl=class extends Dn{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ca(e,s.x,r.x,a.x),ca(e,s.y,r.y,a.y),ca(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ra=class extends Dn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return n.set(kf(o,l.x,c.x,u.x,h.x),kf(o,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new he().fromArray(s))}return this}},Hf=Object.freeze({__proto__:null,ArcCurve:dl,CatmullRomCurve3:fl,CubicBezierCurve:Ea,CubicBezierCurve3:pl,EllipseCurve:Rr,LineCurve:Ta,LineCurve3:ml,QuadraticBezierCurve:Aa,QuadraticBezierCurve3:gl,SplineCurve:Ra}),_l=class extends Dn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Hf[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Hf[s.type]().fromJSON(s))}return this}},Is=class extends _l{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ta(this.currentPoint.clone(),new he(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new Aa(this.currentPoint.clone(),new he(e,t),new he(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){let o=new Ea(this.currentPoint.clone(),new he(e,t),new he(n,s),new he(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Ra(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){let c=new Rr(e,t,n,s,r,a,o,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Cr=class extends Is{constructor(e){super(e),this.uuid=Gn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Is().fromJSON(s))}return this}};function I0(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Ip(i,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=F0(i,e,r,t)),i.length>80*t){o=1/0,l=1/0;let u=-1/0,h=-1/0;for(let d=t;d<s;d+=t){let f=i[d],g=i[d+1];f<o&&(o=f),g<l&&(l=g),f>u&&(u=f),g>h&&(h=g)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Ca(r,a,t,o,l,c,0),a}function Ip(i,e,t,n,s){let r;if(s===X0(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Vf(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Vf(a/n|0,i[a],i[a+1],r);return r&&Pr(r,r.next)&&(Ia(r),r=r.next),r}function Ds(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Pr(t,t.next)||Ct(t.prev,t,t.next)===0)){if(Ia(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Ca(i,e,t,n,s,r,a){if(!i)return;!a&&r&&H0(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?L0(i,n,s,r):D0(i)){e.push(l.i,i.i,c.i),Ia(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=U0(Ds(i),e),Ca(i,e,t,n,s,r,2)):a===2&&N0(i,e,t,n,s,r):Ca(Ds(i),e,t,n,s,r,1);break}}}function D0(i){let e=i.prev,t=i,n=i.next;if(Ct(e,t,n)>=0)return!1;let s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c),g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&aa(s,o,r,l,a,c,g.x,g.y)&&Ct(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function L0(i,e,t,n){let s=i.prev,r=i,a=i.next;if(Ct(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),g=Math.min(u,h,d),_=Math.max(o,l,c),m=Math.max(u,h,d),p=Yu(f,g,e,t,n),M=Yu(_,m,e,t,n),x=i.prevZ,y=i.nextZ;for(;x&&x.z>=p&&y&&y.z<=M;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==a&&aa(o,u,l,h,c,d,x.x,x.y)&&Ct(x.prev,x,x.next)>=0||(x=x.prevZ,y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&aa(o,u,l,h,c,d,y.x,y.y)&&Ct(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;x&&x.z>=p;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==a&&aa(o,u,l,h,c,d,x.x,x.y)&&Ct(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;y&&y.z<=M;){if(y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&aa(o,u,l,h,c,d,y.x,y.y)&&Ct(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function U0(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Pr(n,s)&&Lp(n,t,t.next,s)&&Pa(n,s)&&Pa(s,n)&&(e.push(n.i,t.i,s.i),Ia(t),Ia(t.next),t=i=s),t=t.next}while(t!==i);return Ds(t)}function N0(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&W0(a,o)){let l=Up(a,o);a=Ds(a,a.next),l=Ds(l,l.next),Ca(a,e,t,n,s,r,0),Ca(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function F0(i,e,t,n){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Ip(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(G0(c))}s.sort(O0);for(let r=0;r<s.length;r++)t=z0(s[r],t);return t}function O0(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function z0(i,e){let t=B0(i,e);if(!t)return e;let n=Up(t,i);return Ds(n,n.next),Ds(t,t.next)}function B0(i,e){let t=e,n=i.x,s=i.y,r=-1/0,a;if(Pr(i,t))return t;do{if(Pr(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Dp(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let h=Math.abs(s-t.y)/(n-t.x);Pa(t,i)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&k0(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function k0(i,e){return Ct(i.prev,i,e.prev)<0&&Ct(e.next,i,i.next)<0}function H0(i,e,t,n){let s=i;do s.z===0&&(s.z=Yu(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,V0(s)}function V0(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Yu(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function G0(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Dp(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function aa(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Dp(i,e,t,n,s,r,a,o)}function W0(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!j0(i,e)&&(Pa(i,e)&&Pa(e,i)&&q0(i,e)&&(Ct(i.prev,i,e.prev)||Ct(i,e.prev,e))||Pr(i,e)&&Ct(i.prev,i,i.next)>0&&Ct(e.prev,e,e.next)>0)}function Ct(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Pr(i,e){return i.x===e.x&&i.y===e.y}function Lp(i,e,t,n){let s=el(Ct(i,e,t)),r=el(Ct(i,e,n)),a=el(Ct(t,n,i)),o=el(Ct(t,n,e));return!!(s!==r&&a!==o||s===0&&Qo(i,t,e)||r===0&&Qo(i,n,e)||a===0&&Qo(t,i,n)||o===0&&Qo(t,e,n))}function Qo(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function el(i){return i>0?1:i<0?-1:0}function j0(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Lp(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Pa(i,e){return Ct(i.prev,i,i.next)<0?Ct(i,e,i.next)>=0&&Ct(i,i.prev,e)>=0:Ct(i,e,i.prev)<0||Ct(i,i.next,e)<0}function q0(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Up(i,e){let t=$u(i.i,i.x,i.y),n=$u(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Vf(i,e,t,n){let s=$u(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ia(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function $u(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function X0(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var Zu=class{static triangulate(e,t,n=2){return I0(e,t,n)}},fr=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Gf(e),Wf(n,e);let a=e.length;t.forEach(Gf);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Wf(n,t[l]);let o=Zu.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Gf(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Wf(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Li=class i extends gt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=e/o,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let M=p*d-a;for(let x=0;x<c;x++){let y=x*h-r;g.push(y,-M,0),_.push(0,0,1),m.push(x/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let x=M+c*p,y=M+c*(p+1),w=M+1+c*(p+1),T=M+1+c*p;f.push(x,y,T),f.push(y,w,T)}this.setIndex(f),this.setAttribute("position",new ut(g,3)),this.setAttribute("normal",new ut(_,3)),this.setAttribute("uv",new ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},Da=class i extends gt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],u=[],h=e,d=(t-e)/s,f=new C,g=new he;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){let p=r+m/n*a;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<s;_++){let m=_*(n+1);for(let p=0;p<n;p++){let M=p+m,x=M,y=M+n+1,w=M+n+2,T=M+1;o.push(x,y,T),o.push(y,w,T)}}this.setIndex(o),this.setAttribute("position",new ut(l,3)),this.setAttribute("normal",new ut(c,3)),this.setAttribute("uv",new ut(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},La=class i extends gt{constructor(e=new Cr([new he(0,.5),new he(-.5,-.5),new he(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],r=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(o,l,u),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new ut(s,3)),this.setAttribute("normal",new ut(r,3)),this.setAttribute("uv",new ut(a,2));function c(u){let h=s.length/3,d=u.extractPoints(t),f=d.shape,g=d.holes;fr.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,p=g.length;m<p;m++){let M=g[m];fr.isClockWise(M)===!0&&(g[m]=M.reverse())}let _=fr.triangulateShape(f,g);for(let m=0,p=g.length;m<p;m++){let M=g[m];f=f.concat(M)}for(let m=0,p=f.length;m<p;m++){let M=f[m];s.push(M.x,M.y,0),r.push(0,0,1),a.push(M.x,M.y)}for(let m=0,p=_.length;m<p;m++){let M=_[m],x=M[0]+h,y=M[1]+h,w=M[2]+h;n.push(x,y,w),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Y0(t,e)}static fromJSON(e,t){let n=[];for(let s=0,r=e.shapes.length;s<r;s++){let a=t[e.shapes[s]];n.push(a)}return new i(n,e.curveSegments)}};function Y0(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var Ua=class i extends gt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],h=new C,d=new C,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){let M=[],x=p/n,y=0;p===0&&a===0?y=.5/t:p===n&&l===Math.PI&&(y=-.5/t);for(let w=0;w<=t;w++){let T=w/t;h.x=-e*Math.cos(s+T*r)*Math.sin(a+x*o),h.y=e*Math.cos(a+x*o),h.z=e*Math.sin(s+T*r)*Math.sin(a+x*o),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(T+y,1-x),M.push(c++)}u.push(M)}for(let p=0;p<n;p++)for(let M=0;M<t;M++){let x=u[p][M+1],y=u[p][M],w=u[p+1][M],T=u[p+1][M+1];(p!==0||a>0)&&f.push(x,y,T),(p!==n-1||l<Math.PI)&&f.push(y,w,T)}this.setIndex(f),this.setAttribute("position",new ut(g,3)),this.setAttribute("normal",new ut(_,3)),this.setAttribute("uv",new ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Na=class extends St{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Wt=class extends gn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new De(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=wc,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ln=class extends Wt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new he(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Xe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new De(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new De(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new De(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Fa=class extends gn{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=wc,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}};var yl=class extends gn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=yp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},xl=class extends gn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function tl(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function $0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Z0(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function jf(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function Np(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var Ui=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},vl=class extends Ui{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Gu,endingEnd:Gu}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wu:r=e,o=2*t-n;break;case ju:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Wu:a=e,l=2*n-t;break;case ju:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,M=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-f)*m+(1.5+f)*_+.5*g,y=f*m-f*_;for(let w=0;w!==o;++w)r[w]=p*a[u+w]+M*a[c+w]+x*a[l+w]+y*a[h+w];return r}},bl=class extends Ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==o;++d)r[d]=a[c+d]*h+a[l+d]*u;return r}},Ml=class extends Ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},bn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=tl(t,this.TimeBufferType),this.values=tl(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:tl(e.times,Array),values:tl(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ml(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new bl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new vl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Es:t=this.InterpolantFactoryMethodDiscrete;break;case Ts:t=this.InterpolantFactoryMethodLinear;break;case nl:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Es;case this.InterpolantFactoryMethodLinear:return Ts;case this.InterpolantFactoryMethodSmooth:return nl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&$0(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===nl,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let h=o*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){let _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};bn.prototype.ValueTypeName="";bn.prototype.TimeBufferType=Float32Array;bn.prototype.ValueBufferType=Float32Array;bn.prototype.DefaultInterpolation=Ts;var Ni=class extends bn{constructor(e,t,n){super(e,t,n)}};Ni.prototype.ValueTypeName="bool";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=Es;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var Oa=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};Oa.prototype.ValueTypeName="color";var hi=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};hi.prototype.ValueTypeName="number";var Sl=class extends Ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)Kt.slerpFlat(r,0,a,c-o,a,c,l);return r}},di=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Sl(this.times,this.values,this.getValueSize(),e)}};di.prototype.ValueTypeName="quaternion";di.prototype.InterpolantFactoryMethodSmooth=void 0;var Fi=class extends bn{constructor(e,t,n){super(e,t,n)}};Fi.prototype.ValueTypeName="string";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=Es;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var fi=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};fi.prototype.ValueTypeName="vector";var za=class{constructor(e="",t=-1,n=[],s=_p){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Gn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(J0(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(bn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let u=Z0(l);l=jf(l,1,u),c=jf(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new hi(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],u=c.name.match(r);if(u&&u.length>1){let h=u[1],d=s[h];d||(s[h]=d=[]),d.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,d,f,g,_){if(f.length!==0){let m=[],p=[];Np(f,m,p,g),m.length!==0&&_.push(new h(d,m,p))}},s=[],r=e.name||"default",a=e.fps||30,o=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let h=0;h<c.length;h++){let d=c[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(let _ in f){let m=[],p=[];for(let M=0;M!==d[g].morphTargets.length;++M){let x=d[g];m.push(x.time),p.push(x.morphTarget===_?1:0)}s.push(new hi(".morphTargetInfluence["+_+"]",m,p))}l=f.length*a}else{let f=".bones["+t[h].name+"]";n(fi,f+".position",d,"pos",s),n(di,f+".quaternion",d,"rot",s),n(fi,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,l,s,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function K0(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return hi;case"vector":case"vector2":case"vector3":case"vector4":return fi;case"color":return Oa;case"quaternion":return di;case"bool":case"boolean":return Ni;case"string":return Fi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function J0(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=K0(i.type);if(i.times===void 0){let t=[],n=[];Np(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var ai={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},wl=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Fp=new wl,ti=class{constructor(e){this.manager=e!==void 0?e:Fp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ti.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ci={},Ku=class extends Error{constructor(e,t){super(e),this.response=t}},Ls=class extends ti{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ai.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Ci[e]!==void 0){Ci[e].push({onLoad:t,onProgress:n,onError:s});return}Ci[e]=[],Ci[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Ci[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,_=0,m=new ReadableStream({start(p){M();function M(){h.read().then(({done:x,value:y})=>{if(x)p.close();else{_+=y.byteLength;let w=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let T=0,P=u.length;T<P;T++){let A=u[T];A.onProgress&&A.onProgress(w)}p.enqueue(y),M()}},x=>{p.error(x)})}}});return new Response(m)}else throw new Ku(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{ai.add(`file:${e}`,c);let u=Ci[e];delete Ci[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{let u=Ci[e];if(u===void 0)throw this.manager.itemError(e),c;delete Ci[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var hr=new WeakMap,El=class extends ti{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=hr.get(a);h===void 0&&(h=[],hr.set(a,h)),h.push({onLoad:t,onError:s})}return a}let o=gr("img");function l(){u(),t&&t(this);let h=hr.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}hr.delete(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),ai.remove(`image:${e}`);let d=hr.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(h)}hr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ai.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var Ba=class extends ti{constructor(e){super(e)}load(e,t,n,s){let r=this,a=new ci,o=new Ls(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){let c;try{c=r.parse(l)}catch(u){if(s!==void 0)s(u);else{console.error(u);return}}c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:Vn,a.wrapT=c.wrapT!==void 0?c.wrapT:Vn,a.magFilter=c.magFilter!==void 0?c.magFilter:Lt,a.minFilter=c.minFilter!==void 0?c.minFilter:Lt,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(a.colorSpace=c.colorSpace),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=Sn),c.mipmapCount===1&&(a.minFilter=Lt),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c)},n,s),a}},Us=class extends ti{constructor(e){super(e)}load(e,t,n,s){let r=new $t,a=new El(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Ns=class extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new De(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},ka=class extends Ns{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new De(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Bu=new Ce,qf=new C,Xf=new C,Ha=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.mapType=Nn,this.map=null,this.mapPass=null,this.matrix=new Ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ts,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;qf.setFromMatrixPosition(e.matrixWorld),t.position.copy(qf),Xf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Xf),t.updateMatrixWorld(),Bu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bu,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Bu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ju=class extends Ha{constructor(){super(new Dt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=As*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Va=class extends Ns{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Ju}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Yf=new Ce,ra=new C,ku=new C,Qu=class extends Ha{constructor(){super(new Dt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new he(4,2),this._viewportCount=6,this._viewports=[new nt(2,1,1,1),new nt(0,1,1,1),new nt(3,1,1,1),new nt(1,1,1,1),new nt(3,0,1,1),new nt(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ra.setFromMatrixPosition(e.matrixWorld),n.position.copy(ra),ku.copy(n.position),ku.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ku),n.updateMatrixWorld(),s.makeTranslation(-ra.x,-ra.y,-ra.z),Yf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yf,n.coordinateSystem,n.reversedDepth)}},Ga=class extends Ns{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Qu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Oi=class extends ga{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},eh=class extends Ha{constructor(){super(new Oi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Fs=class extends Ns{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new eh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var zi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Hu=new WeakMap,Wa=class extends ti{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{if(Hu.has(a)===!0)s&&s(Hu.get(a)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ai.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Hu.set(l,c),ai.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ai.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Tl=class extends Dt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},ja=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var wh="\\[\\]\\.:\\/",Q0=new RegExp("["+wh+"]","g"),Eh="[^"+wh+"]",e_="[^"+wh.replace("\\.","")+"]",t_=/((?:WC+[\/:])*)/.source.replace("WC",Eh),n_=/(WCOD+)?/.source.replace("WCOD",e_),i_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Eh),s_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Eh),r_=new RegExp("^"+t_+n_+i_+s_+"$"),a_=["material","materials","bones","map"],th=class{constructor(e,t,n){let s=n||vt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},vt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Q0,"")}static parseTrackName(e){let t=r_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);a_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};vt.Composite=th;vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};vt.prototype.GetterByBindingType=[vt.prototype._getValue_direct,vt.prototype._getValue_array,vt.prototype._getValue_arrayElement,vt.prototype._getValue_toArray];vt.prototype.SetterByBindingTypeAndVersioning=[[vt.prototype._setValue_direct,vt.prototype._setValue_direct_setNeedsUpdate,vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_array,vt.prototype._setValue_array_setNeedsUpdate,vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_arrayElement,vt.prototype._setValue_arrayElement_setNeedsUpdate,vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_fromArray,vt.prototype._setValue_fromArray_setNeedsUpdate,vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Xb=new Float32Array(1);var $f=new Ce,Os=class{constructor(e,t,n=0,s=1/0){this.ray=new li(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new xr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return $f.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4($f),this}intersectObject(e,t=!0,n=[]){return nh(e,this,n,t),n.sort(Zf),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)nh(e[s],this,n,t);return n.sort(Zf),n}};function Zf(i,e){return i.distance-e.distance}function nh(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)nh(r[a],e,t,!0)}}var Ir=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Xe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Xe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var qa=class extends oi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Th(i,e,t,n){let s=o_(n);switch(t){case fh:return i*e;case ql:return i*e/s.components*s.byteLength;case Xl:return i*e/s.components*s.byteLength;case mh:return i*e*2/s.components*s.byteLength;case Yl:return i*e*2/s.components*s.byteLength;case ph:return i*e*3/s.components*s.byteLength;case _n:return i*e*4/s.components*s.byteLength;case $l:return i*e*4/s.components*s.byteLength;case Ka:case Ja:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Qa:case eo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Kl:case Ql:return Math.max(i,16)*Math.max(e,8)/4;case Zl:case Jl:return Math.max(i,8)*Math.max(e,8)/2;case ec:case tc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case nc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ic:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case sc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case rc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ac:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case oc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case lc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case cc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case uc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case hc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case dc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case fc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case pc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case mc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case gc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case _c:case yc:case xc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case vc:case bc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Mc:case Sc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function o_(i){switch(i){case Nn:case ch:return{byteLength:1,components:1};case Nr:case uh:case Ut:return{byteLength:2,components:1};case Wl:case jl:return{byteLength:2,components:4};case ns:case Gl:case cn:return{byteLength:4,components:1};case hh:case dh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function am(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function c_(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){let g=h[d],_=h[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){let _=h[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var u_=`#ifdef USE_ALPHAHASH
  if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,h_=`#ifdef USE_ALPHAHASH
  const float ALPHA_HASH_SCALE = 0.05;
  float hash2D( vec2 value ) {
    return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
  }
  float hash3D( vec3 value ) {
    return hash2D( vec2( hash2D( value.xy ), value.z ) );
  }
  float getAlphaHashThreshold( vec3 position ) {
    float maxDeriv = max(
      length( dFdx( position.xyz ) ),
      length( dFdy( position.xyz ) )
    );
    float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
    vec2 pixScales = vec2(
      exp2( floor( log2( pixScale ) ) ),
      exp2( ceil( log2( pixScale ) ) )
    );
    vec2 alpha = vec2(
      hash3D( floor( pixScales.x * position.xyz ) ),
      hash3D( floor( pixScales.y * position.xyz ) )
    );
    float lerpFactor = fract( log2( pixScale ) );
    float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
    float a = min( lerpFactor, 1.0 - lerpFactor );
    vec3 cases = vec3(
      x * x / ( 2.0 * a * ( 1.0 - a ) ),
      ( x - 0.5 * a ) / ( 1.0 - a ),
      1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
    );
    float threshold = ( x < ( 1.0 - a ) )
      ? ( ( x < a ) ? cases.x : cases.y )
      : cases.z;
    return clamp( threshold , 1.0e-6, 1.0 );
  }
#endif`,d_=`#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,f_=`#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,p_=`#ifdef USE_ALPHATEST
  #ifdef ALPHA_TO_COVERAGE
  diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
  if ( diffuseColor.a == 0.0 ) discard;
  #else
  if ( diffuseColor.a < alphaTest ) discard;
  #endif
#endif`,m_=`#ifdef USE_ALPHATEST
  uniform float alphaTest;
#endif`,g_=`#ifdef USE_AOMAP
  float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
  reflectedLight.indirectDiffuse *= ambientOcclusion;
  #if defined( USE_CLEARCOAT )
    clearcoatSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_SHEEN )
    sheenSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD )
    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
    reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
  #endif
#endif`,__=`#ifdef USE_AOMAP
  uniform sampler2D aoMap;
  uniform float aoMapIntensity;
#endif`,y_=`#ifdef USE_BATCHING
  #if ! defined( GL_ANGLE_multi_draw )
  #define gl_DrawID _gl_DrawID
  uniform int _gl_DrawID;
  #endif
  uniform highp sampler2D batchingTexture;
  uniform highp usampler2D batchingIdTexture;
  mat4 getBatchingMatrix( const in float i ) {
    int size = textureSize( batchingTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
  float getIndirectIndex( const in int i ) {
    int size = textureSize( batchingIdTexture, 0 ).x;
    int x = i % size;
    int y = i / size;
    return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
  }
#endif
#ifdef USE_BATCHING_COLOR
  uniform sampler2D batchingColorTexture;
  vec3 getBatchingColor( const in float i ) {
    int size = textureSize( batchingColorTexture, 0 ).x;
    int j = int( i );
    int x = j % size;
    int y = j / size;
    return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
  }
#endif`,x_=`#ifdef USE_BATCHING
  mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,v_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
  vPosition = vec3( position );
#endif`,b_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif`,M_=`float G_BlinnPhong_Implicit( ) {
  return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
  return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( specularColor, 1.0, dotVH );
  float G = G_BlinnPhong_Implicit( );
  float D = D_BlinnPhong( shininess, dotNH );
  return F * ( G * D );
} // validated`,S_=`#ifdef USE_IRIDESCENCE
  const mat3 XYZ_TO_REC709 = mat3(
     3.2404542, -0.9692660,  0.0556434,
    -1.5371385,  1.8760108, -0.2040259,
    -0.4985314,  0.0415560,  1.0572252
  );
  vec3 Fresnel0ToIor( vec3 fresnel0 ) {
    vec3 sqrtF0 = sqrt( fresnel0 );
    return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
  }
  vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
  }
  float IorToFresnel0( float transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
  }
  vec3 evalSensitivity( float OPD, vec3 shift ) {
    float phase = 2.0 * PI * OPD * 1.0e-9;
    vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
    vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
    vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
    vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
    xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
    xyz /= 1.0685e-7;
    vec3 rgb = XYZ_TO_REC709 * xyz;
    return rgb;
  }
  vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
    vec3 I;
    float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
    float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
    float cosTheta2Sq = 1.0 - sinTheta2Sq;
    if ( cosTheta2Sq < 0.0 ) {
      return vec3( 1.0 );
    }
    float cosTheta2 = sqrt( cosTheta2Sq );
    float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
    float R12 = F_Schlick( R0, 1.0, cosTheta1 );
    float T121 = 1.0 - R12;
    float phi12 = 0.0;
    if ( iridescenceIOR < outsideIOR ) phi12 = PI;
    float phi21 = PI - phi12;
    vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
    vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
    vec3 phi23 = vec3( 0.0 );
    if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
    if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
    if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
    float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
    vec3 phi = vec3( phi21 ) + phi23;
    vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
    vec3 r123 = sqrt( R123 );
    vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
    vec3 C0 = R12 + Rs;
    I = C0;
    vec3 Cm = Rs - T121;
    for ( int m = 1; m <= 2; ++ m ) {
      Cm *= r123;
      vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
      I += Cm * Sm;
    }
    return max( I, vec3( 0.0 ) );
  }
#endif`,w_=`#ifdef USE_BUMPMAP
  uniform sampler2D bumpMap;
  uniform float bumpScale;
  vec2 dHdxy_fwd() {
    vec2 dSTdx = dFdx( vBumpMapUv );
    vec2 dSTdy = dFdy( vBumpMapUv );
    float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
    float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
    float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
    return vec2( dBx, dBy );
  }
  vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
    vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
    vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
    vec3 vN = surf_norm;
    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );
    float fDet = dot( vSigmaX, R1 ) * faceDirection;
    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );
  }
#endif`,E_=`#if NUM_CLIPPING_PLANES > 0
  vec4 plane;
  #ifdef ALPHA_TO_COVERAGE
    float distanceToPlane, distanceGradient;
    float clipOpacity = 1.0;
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
      distanceGradient = fwidth( distanceToPlane ) / 2.0;
      clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      if ( clipOpacity == 0.0 ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      float unionClipOpacity = 1.0;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
        distanceGradient = fwidth( distanceToPlane ) / 2.0;
        unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      }
      #pragma unroll_loop_end
      clipOpacity *= 1.0 - unionClipOpacity;
    #endif
    diffuseColor.a *= clipOpacity;
    if ( diffuseColor.a == 0.0 ) discard;
  #else
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      bool clipped = true;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
      }
      #pragma unroll_loop_end
      if ( clipped ) discard;
    #endif
  #endif
#endif`,T_=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
  uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,A_=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
#endif`,R_=`#if NUM_CLIPPING_PLANES > 0
  vClipPosition = - mvPosition.xyz;
#endif`,C_=`#if defined( USE_COLOR_ALPHA )
  diffuseColor *= vColor;
#elif defined( USE_COLOR )
  diffuseColor.rgb *= vColor;
#endif`,P_=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR )
  varying vec3 vColor;
#endif`,I_=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  varying vec3 vColor;
#endif`,D_=`#if defined( USE_COLOR_ALPHA )
  vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
  vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
  vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
  vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
  vColor.xyz *= batchingColor.xyz;
#endif`,L_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
  float precisionSafeLength( vec3 v ) { return length( v ); }
#else
  float precisionSafeLength( vec3 v ) {
    float maxComponent = max3( abs( v ) );
    return length( v / maxComponent ) * maxComponent;
  }
#endif
struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};
struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
  varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
  mat3 tmp;
  tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
  tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
  tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
  return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
  return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
  float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
  float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
  return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
  return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,U_=`#ifdef ENVMAP_TYPE_CUBE_UV
  #define cubeUV_minMipLevel 4.0
  #define cubeUV_minTileSize 16.0
  float getFace( vec3 direction ) {
    vec3 absDirection = abs( direction );
    float face = - 1.0;
    if ( absDirection.x > absDirection.z ) {
      if ( absDirection.x > absDirection.y )
        face = direction.x > 0.0 ? 0.0 : 3.0;
      else
        face = direction.y > 0.0 ? 1.0 : 4.0;
    } else {
      if ( absDirection.z > absDirection.y )
        face = direction.z > 0.0 ? 2.0 : 5.0;
      else
        face = direction.y > 0.0 ? 1.0 : 4.0;
    }
    return face;
  }
  vec2 getUV( vec3 direction, float face ) {
    vec2 uv;
    if ( face == 0.0 ) {
      uv = vec2( direction.z, direction.y ) / abs( direction.x );
    } else if ( face == 1.0 ) {
      uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
    } else if ( face == 2.0 ) {
      uv = vec2( - direction.x, direction.y ) / abs( direction.z );
    } else if ( face == 3.0 ) {
      uv = vec2( - direction.z, direction.y ) / abs( direction.x );
    } else if ( face == 4.0 ) {
      uv = vec2( - direction.x, direction.z ) / abs( direction.y );
    } else {
      uv = vec2( direction.x, direction.y ) / abs( direction.z );
    }
    return 0.5 * ( uv + 1.0 );
  }
  vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
    float face = getFace( direction );
    float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
    mipInt = max( mipInt, cubeUV_minMipLevel );
    float faceSize = exp2( mipInt );
    highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
    if ( face > 2.0 ) {
      uv.y += faceSize;
      face -= 3.0;
    }
    uv.x += face * faceSize;
    uv.x += filterInt * 3.0 * cubeUV_minTileSize;
    uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
    uv.x *= CUBEUV_TEXEL_WIDTH;
    uv.y *= CUBEUV_TEXEL_HEIGHT;
    #ifdef texture2DGradEXT
      return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
    #else
      return texture2D( envMap, uv ).rgb;
    #endif
  }
  #define cubeUV_r0 1.0
  #define cubeUV_m0 - 2.0
  #define cubeUV_r1 0.8
  #define cubeUV_m1 - 1.0
  #define cubeUV_r4 0.4
  #define cubeUV_m4 2.0
  #define cubeUV_r5 0.305
  #define cubeUV_m5 3.0
  #define cubeUV_r6 0.21
  #define cubeUV_m6 4.0
  float roughnessToMip( float roughness ) {
    float mip = 0.0;
    if ( roughness >= cubeUV_r1 ) {
      mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
    } else if ( roughness >= cubeUV_r4 ) {
      mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
    } else if ( roughness >= cubeUV_r5 ) {
      mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
    } else if ( roughness >= cubeUV_r6 ) {
      mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
    } else {
      mip = - 2.0 * log2( 1.16 * roughness );		}
    return mip;
  }
  vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
    float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
    float mipF = fract( mip );
    float mipInt = floor( mip );
    vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
    if ( mipF == 0.0 ) {
      return vec4( color0, 1.0 );
    } else {
      vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
      return vec4( mix( color0, color1, mipF ), 1.0 );
    }
  }
#endif`,N_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
  vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
  mat3 bm = mat3( batchingMatrix );
  transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
  transformedNormal = bm * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = bm * transformedTangent;
  #endif
#endif
#ifdef USE_INSTANCING
  mat3 im = mat3( instanceMatrix );
  transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
  transformedNormal = im * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = im * transformedTangent;
  #endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
  transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
  transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
  #ifdef FLIP_SIDED
    transformedTangent = - transformedTangent;
  #endif
#endif`,F_=`#ifdef USE_DISPLACEMENTMAP
  uniform sampler2D displacementMap;
  uniform float displacementScale;
  uniform float displacementBias;
#endif`,O_=`#ifdef USE_DISPLACEMENTMAP
  transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,z_=`#ifdef USE_EMISSIVEMAP
  vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
  #ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
    emissiveColor = sRGBTransferEOTF( emissiveColor );
  #endif
  totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,B_=`#ifdef USE_EMISSIVEMAP
  uniform sampler2D emissiveMap;
#endif`,k_="gl_FragColor = linearToOutputTexel( gl_FragColor );",H_=`vec4 LinearTransferOETF( in vec4 value ) {
  return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,V_=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vec3 cameraToFrag;
    if ( isOrthographic ) {
      cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToFrag = normalize( vWorldPosition - cameraPosition );
    }
    vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vec3 reflectVec = reflect( cameraToFrag, worldNormal );
    #else
      vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
    #endif
  #else
    vec3 reflectVec = vReflect;
  #endif
  #ifdef ENVMAP_TYPE_CUBE
    vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
  #else
    vec4 envColor = vec4( 0.0 );
  #endif
  #ifdef ENVMAP_BLENDING_MULTIPLY
    outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
  #elif defined( ENVMAP_BLENDING_MIX )
    outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
  #elif defined( ENVMAP_BLENDING_ADD )
    outgoingLight += envColor.xyz * specularStrength * reflectivity;
  #endif
#endif`,G_=`#ifdef USE_ENVMAP
  uniform float envMapIntensity;
  uniform float flipEnvMap;
  uniform mat3 envMapRotation;
  #ifdef ENVMAP_TYPE_CUBE
    uniform samplerCube envMap;
  #else
    uniform sampler2D envMap;
  #endif

#endif`,W_=`#ifdef USE_ENVMAP
  uniform float reflectivity;
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS
    varying vec3 vWorldPosition;
    uniform float refractionRatio;
  #else
    varying vec3 vReflect;
  #endif
#endif`,j_=`#ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS

    varying vec3 vWorldPosition;
  #else
    varying vec3 vReflect;
    uniform float refractionRatio;
  #endif
#endif`,q_=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vWorldPosition = worldPosition.xyz;
  #else
    vec3 cameraToVertex;
    if ( isOrthographic ) {
      cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    }
    vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vReflect = reflect( cameraToVertex, worldNormal );
    #else
      vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
    #endif
  #endif
#endif`,X_=`#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
#endif`,Y_=`#ifdef USE_FOG
  varying float vFogDepth;
#endif`,$_=`#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Z_=`#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`,K_=`#ifdef USE_GRADIENTMAP
  uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
  float dotNL = dot( normal, lightDirection );
  vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
  #ifdef USE_GRADIENTMAP
    return vec3( texture2D( gradientMap, coord ).r );
  #else
    vec2 fw = fwidth( coord ) * 0.5;
    return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
  #endif
}`,J_=`#ifdef USE_LIGHTMAP
  uniform sampler2D lightMap;
  uniform float lightMapIntensity;
#endif`,Q_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,e1=`varying vec3 vViewPosition;
struct LambertMaterial {
  vec3 diffuseColor;
  float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,t1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
  uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
  float x = normal.x, y = normal.y, z = normal.z;
  vec3 result = shCoefficients[ 0 ] * 0.886227;
  result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
  result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
  result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
  result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
  result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
  result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
  result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
  result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
  return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
  vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
  vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
  return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
  vec3 irradiance = ambientLightColor;
  return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
  float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
  if ( cutoffDistance > 0.0 ) {
    distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
  }
  return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
  return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
  struct DirectionalLight {
    vec3 direction;
    vec3 color;
  };
  uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
  void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
    light.color = directionalLight.color;
    light.direction = directionalLight.direction;
    light.visible = true;
  }
#endif
#if NUM_POINT_LIGHTS > 0
  struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
  };
  uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
  void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = pointLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float lightDistance = length( lVector );
    light.color = pointLight.color;
    light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
    light.visible = ( light.color != vec3( 0.0 ) );
  }
#endif
#if NUM_SPOT_LIGHTS > 0
  struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 color;
    float distance;
    float decay;
    float coneCos;
    float penumbraCos;
  };
  uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
  void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = spotLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float angleCos = dot( light.direction, spotLight.direction );
    float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
    if ( spotAttenuation > 0.0 ) {
      float lightDistance = length( lVector );
      light.color = spotLight.color * spotAttenuation;
      light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
      light.visible = ( light.color != vec3( 0.0 ) );
    } else {
      light.color = vec3( 0.0 );
      light.visible = false;
    }
  }
#endif
#if NUM_RECT_AREA_LIGHTS > 0
  struct RectAreaLight {
    vec3 color;
    vec3 position;
    vec3 halfWidth;
    vec3 halfHeight;
  };
  uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
  uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
  struct HemisphereLight {
    vec3 direction;
    vec3 skyColor;
    vec3 groundColor;
  };
  uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
  vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
    float dotNL = dot( normal, hemiLight.direction );
    float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
    vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
    return irradiance;
  }
#endif`,n1=`#ifdef USE_ENVMAP
  vec3 getIBLIrradiance( const in vec3 normal ) {
    #ifdef ENVMAP_TYPE_CUBE_UV
      vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
      vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
      return PI * envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
    #ifdef ENVMAP_TYPE_CUBE_UV
      vec3 reflectVec = reflect( - viewDir, normal );
      reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
      reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
      vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
      return envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  #ifdef USE_ANISOTROPY
    vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
      #ifdef ENVMAP_TYPE_CUBE_UV
        vec3 bentNormal = cross( bitangent, viewDir );
        bentNormal = normalize( cross( bentNormal, bitangent ) );
        bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
        return getIBLRadiance( viewDir, bentNormal, roughness );
      #else
        return vec3( 0.0 );
      #endif
    }
  #endif
#endif`,i1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,s1=`varying vec3 vViewPosition;
struct ToonMaterial {
  vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,r1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,a1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
  vec3 diffuseColor;
  vec3 specularColor;
  float specularShininess;
  float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
  reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,o1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
  material.ior = ior;
  #ifdef USE_SPECULAR
    float specularIntensityFactor = specularIntensity;
    vec3 specularColorFactor = specularColor;
    #ifdef USE_SPECULAR_COLORMAP
      specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
    #endif
    #ifdef USE_SPECULAR_INTENSITYMAP
      specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
    #endif
    material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
  #else
    float specularIntensityFactor = 1.0;
    vec3 specularColorFactor = vec3( 1.0 );
    material.specularF90 = 1.0;
  #endif
  material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
  material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
  material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
  material.clearcoat = clearcoat;
  material.clearcoatRoughness = clearcoatRoughness;
  material.clearcoatF0 = vec3( 0.04 );
  material.clearcoatF90 = 1.0;
  #ifdef USE_CLEARCOATMAP
    material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
  #endif
  #ifdef USE_CLEARCOAT_ROUGHNESSMAP
    material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
  #endif
  material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
  material.clearcoatRoughness += geometryRoughness;
  material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
  material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
  material.iridescence = iridescence;
  material.iridescenceIOR = iridescenceIOR;
  #ifdef USE_IRIDESCENCEMAP
    material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
  #endif
  #ifdef USE_IRIDESCENCE_THICKNESSMAP
    material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
  #else
    material.iridescenceThickness = iridescenceThicknessMaximum;
  #endif
#endif
#ifdef USE_SHEEN
  material.sheenColor = sheenColor;
  #ifdef USE_SHEEN_COLORMAP
    material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
  #endif
  material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
  #ifdef USE_SHEEN_ROUGHNESSMAP
    material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
  #endif
#endif
#ifdef USE_ANISOTROPY
  #ifdef USE_ANISOTROPYMAP
    mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
    vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
    vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
  #else
    vec2 anisotropyV = anisotropyVector;
  #endif
  material.anisotropy = length( anisotropyV );
  if( material.anisotropy == 0.0 ) {
    anisotropyV = vec2( 1.0, 0.0 );
  } else {
    anisotropyV /= material.anisotropy;
    material.anisotropy = saturate( material.anisotropy );
  }
  material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
  material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
  material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,l1=`struct PhysicalMaterial {
  vec3 diffuseColor;
  float roughness;
  vec3 specularColor;
  float specularF90;
  float dispersion;
  #ifdef USE_CLEARCOAT
    float clearcoat;
    float clearcoatRoughness;
    vec3 clearcoatF0;
    float clearcoatF90;
  #endif
  #ifdef USE_IRIDESCENCE
    float iridescence;
    float iridescenceIOR;
    float iridescenceThickness;
    vec3 iridescenceFresnel;
    vec3 iridescenceF0;
  #endif
  #ifdef USE_SHEEN
    vec3 sheenColor;
    float sheenRoughness;
  #endif
  #ifdef IOR
    float ior;
  #endif
  #ifdef USE_TRANSMISSION
    float transmission;
    float transmissionAlpha;
    float thickness;
    float attenuationDistance;
    vec3 attenuationColor;
  #endif
  #ifdef USE_ANISOTROPY
    float anisotropy;
    float alphaT;
    vec3 anisotropyT;
    vec3 anisotropyB;
  #endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
  float a2 = pow2( alpha );
  float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
  float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
  return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
  float a2 = pow2( alpha );
  float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
  return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
  float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
    float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
    float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
    float v = 0.5 / ( gv + gl );
    return saturate(v);
  }
  float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
    float a2 = alphaT * alphaB;
    highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
    highp float v2 = dot( v, v );
    float w2 = a2 / v2;
    return RECIPROCAL_PI * a2 * pow2 ( w2 );
  }
#endif
#ifdef USE_CLEARCOAT
  vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
    vec3 f0 = material.clearcoatF0;
    float f90 = material.clearcoatF90;
    float roughness = material.clearcoatRoughness;
    float alpha = pow2( roughness );
    vec3 halfDir = normalize( lightDir + viewDir );
    float dotNL = saturate( dot( normal, lightDir ) );
    float dotNV = saturate( dot( normal, viewDir ) );
    float dotNH = saturate( dot( normal, halfDir ) );
    float dotVH = saturate( dot( viewDir, halfDir ) );
    vec3 F = F_Schlick( f0, f90, dotVH );
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
    return F * ( V * D );
  }
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
  vec3 f0 = material.specularColor;
  float f90 = material.specularF90;
  float roughness = material.roughness;
  float alpha = pow2( roughness );
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( f0, f90, dotVH );
  #ifdef USE_IRIDESCENCE
    F = mix( F, material.iridescenceFresnel, material.iridescence );
  #endif
  #ifdef USE_ANISOTROPY
    float dotTL = dot( material.anisotropyT, lightDir );
    float dotTV = dot( material.anisotropyT, viewDir );
    float dotTH = dot( material.anisotropyT, halfDir );
    float dotBL = dot( material.anisotropyB, lightDir );
    float dotBV = dot( material.anisotropyB, viewDir );
    float dotBH = dot( material.anisotropyB, halfDir );
    float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
    float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
  #else
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
  #endif
  return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
  const float LUT_SIZE = 64.0;
  const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
  const float LUT_BIAS = 0.5 / LUT_SIZE;
  float dotNV = saturate( dot( N, V ) );
  vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
  uv = uv * LUT_SCALE + LUT_BIAS;
  return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
  float l = length( f );
  return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
  float x = dot( v1, v2 );
  float y = abs( x );
  float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
  float b = 3.4175940 + ( 4.1616724 + y ) * y;
  float v = a / b;
  float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
  return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
  vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
  vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
  vec3 lightNormal = cross( v1, v2 );
  if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
  vec3 T1, T2;
  T1 = normalize( V - N * dot( V, N ) );
  T2 = - cross( N, T1 );
  mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
  vec3 coords[ 4 ];
  coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
  coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
  coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
  coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
  coords[ 0 ] = normalize( coords[ 0 ] );
  coords[ 1 ] = normalize( coords[ 1 ] );
  coords[ 2 ] = normalize( coords[ 2 ] );
  coords[ 3 ] = normalize( coords[ 3 ] );
  vec3 vectorFormFactor = vec3( 0.0 );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
  float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
  return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
  float alpha = pow2( roughness );
  float invAlpha = 1.0 / alpha;
  float cos2h = dotNH * dotNH;
  float sin2h = max( 1.0 - cos2h, 0.0078125 );
  return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
  return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float D = D_Charlie( sheenRoughness, dotNH );
  float V = V_Neubelt( dotNV, dotNL );
  return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  float r2 = roughness * roughness;
  float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
  float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
  float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
  return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
  vec4 r = roughness * c0 + c1;
  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
  vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
  return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
  vec2 fab = DFGApprox( normal, viewDir, roughness );
  return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
  vec2 fab = DFGApprox( normal, viewDir, roughness );
  #ifdef USE_IRIDESCENCE
    vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
  #else
    vec3 Fr = specularColor;
  #endif
  vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
  float Ess = fab.x + fab.y;
  float Ems = 1.0 - Ess;
  vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
  singleScatter += FssEss;
  multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
  void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
    vec3 normal = geometryNormal;
    vec3 viewDir = geometryViewDir;
    vec3 position = geometryPosition;
    vec3 lightPos = rectAreaLight.position;
    vec3 halfWidth = rectAreaLight.halfWidth;
    vec3 halfHeight = rectAreaLight.halfHeight;
    vec3 lightColor = rectAreaLight.color;
    float roughness = material.roughness;
    vec3 rectCoords[ 4 ];
    rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
    rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
    rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
    vec2 uv = LTC_Uv( normal, viewDir, roughness );
    vec4 t1 = texture2D( ltc_1, uv );
    vec4 t2 = texture2D( ltc_2, uv );
    mat3 mInv = mat3(
      vec3( t1.x, 0, t1.y ),
      vec3(    0, 1,    0 ),
      vec3( t1.z, 0, t1.w )
    );
    vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
    reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
    reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
  }
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  #ifdef USE_CLEARCOAT
    float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
    vec3 ccIrradiance = dotNLcc * directLight.color;
    clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
  #endif
  #ifdef USE_SHEEN
    sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
  #endif
  reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  #ifdef USE_CLEARCOAT
    clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
  #endif
  #ifdef USE_SHEEN
    sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
  #endif
  vec3 singleScattering = vec3( 0.0 );
  vec3 multiScattering = vec3( 0.0 );
  vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
  #ifdef USE_IRIDESCENCE
    computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
  #else
    computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
  #endif
  vec3 totalScattering = singleScattering + multiScattering;
  vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
  reflectedLight.indirectSpecular += radiance * singleScattering;
  reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
  reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
  return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,c1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
  geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
  float dotNVi = saturate( dot( normal, geometryViewDir ) );
  if ( material.iridescenceThickness == 0.0 ) {
    material.iridescence = 0.0;
  } else {
    material.iridescence = saturate( material.iridescence );
  }
  if ( material.iridescence > 0.0 ) {
    material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
    material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
  }
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
  PointLight pointLight;
  #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
  PointLightShadow pointLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
    pointLight = pointLights[ i ];
    getPointLightInfo( pointLight, geometryPosition, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
    pointLightShadow = pointLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
  SpotLight spotLight;
  vec4 spotColor;
  vec3 spotLightCoord;
  bool inSpotLightMap;
  #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
    spotLight = spotLights[ i ];
    getSpotLightInfo( spotLight, geometryPosition, directLight );
    #if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
    #elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    #define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
    #else
    #define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #endif
    #if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
      spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
      inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
      spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
      directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
    #endif
    #undef SPOT_LIGHT_MAP_INDEX
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    spotLightShadow = spotLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
  DirectionalLight directionalLight;
  #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
    directionalLight = directionalLights[ i ];
    getDirectionalLightInfo( directionalLight, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
    directionalLightShadow = directionalLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
  RectAreaLight rectAreaLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
    rectAreaLight = rectAreaLights[ i ];
    RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
  vec3 iblIrradiance = vec3( 0.0 );
  vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
  #if defined( USE_LIGHT_PROBES )
    irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
  #endif
  #if ( NUM_HEMI_LIGHTS > 0 )
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
      irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
    }
    #pragma unroll_loop_end
  #endif
#endif
#if defined( RE_IndirectSpecular )
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,u1=`#if defined( RE_IndirectDiffuse )
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
    irradiance += lightMapIrradiance;
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
    iblIrradiance += getIBLIrradiance( geometryNormal );
  #endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
  #ifdef USE_ANISOTROPY
    radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
  #else
    radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
  #endif
  #ifdef USE_CLEARCOAT
    clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
  #endif
#endif`,h1=`#if defined( RE_IndirectDiffuse )
  RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
  RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,d1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,f1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  uniform float logDepthBufFC;
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,p1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,m1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  vFragDepth = 1.0 + gl_Position.w;
  vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,g1=`#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
  #endif
  diffuseColor *= sampledDiffuseColor;
#endif`,_1=`#ifdef USE_MAP
  uniform sampler2D map;
#endif`,y1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
  #if defined( USE_POINTS_UV )
    vec2 uv = vUv;
  #else
    vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
  #endif
#endif
#ifdef USE_MAP
  diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,x1=`#if defined( USE_POINTS_UV )
  varying vec2 vUv;
#else
  #if defined( USE_MAP ) || defined( USE_ALPHAMAP )
    uniform mat3 uvTransform;
  #endif
#endif
#ifdef USE_MAP
  uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,v1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
  vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
  metalnessFactor *= texelMetalness.b;
#endif`,b1=`#ifdef USE_METALNESSMAP
  uniform sampler2D metalnessMap;
#endif`,M1=`#ifdef USE_INSTANCING_MORPH
  float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
  }
#endif`,S1=`#if defined( USE_MORPHCOLORS )
  vColor *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    #if defined( USE_COLOR_ALPHA )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
    #elif defined( USE_COLOR )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
    #endif
  }
#endif`,w1=`#ifdef USE_MORPHNORMALS
  objectNormal *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,E1=`#ifdef USE_MORPHTARGETS
  #ifndef USE_INSTANCING_MORPH
    uniform float morphTargetBaseInfluence;
    uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  #endif
  uniform sampler2DArray morphTargetsTexture;
  uniform ivec2 morphTargetsTextureSize;
  vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
    int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
    int y = texelIndex / morphTargetsTextureSize.x;
    int x = texelIndex - y * morphTargetsTextureSize.x;
    ivec3 morphUV = ivec3( x, y, morphTargetIndex );
    return texelFetch( morphTargetsTexture, morphUV, 0 );
  }
#endif`,T1=`#ifdef USE_MORPHTARGETS
  transformed *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,A1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
  vec3 fdx = dFdx( vViewPosition );
  vec3 fdy = dFdy( vViewPosition );
  vec3 normal = normalize( cross( fdx, fdy ) );
#else
  vec3 normal = normalize( vNormal );
  #ifdef DOUBLE_SIDED
    normal *= faceDirection;
  #endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
  #ifdef USE_TANGENT
    mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn = getTangentFrame( - vViewPosition, normal,
    #if defined( USE_NORMALMAP )
      vNormalMapUv
    #elif defined( USE_CLEARCOAT_NORMALMAP )
      vClearcoatNormalMapUv
    #else
      vUv
    #endif
    );
  #endif
  #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
    tbn[0] *= faceDirection;
    tbn[1] *= faceDirection;
  #endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  #ifdef USE_TANGENT
    mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
  #endif
  #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
    tbn2[0] *= faceDirection;
    tbn2[1] *= faceDirection;
  #endif
#endif
vec3 nonPerturbedNormal = normal;`,R1=`#ifdef USE_NORMALMAP_OBJECTSPACE
  normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  #ifdef FLIP_SIDED
    normal = - normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
  normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  mapN.xy *= normalScale;
  normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
  normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,C1=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,P1=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,I1=`#ifndef FLAT_SHADED
  vNormal = normalize( transformedNormal );
  #ifdef USE_TANGENT
    vTangent = normalize( transformedTangent );
    vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
  #endif
#endif`,D1=`#ifdef USE_NORMALMAP
  uniform sampler2D normalMap;
  uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
  uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
  mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    vec3 N = surf_norm;
    vec3 q1perp = cross( q1, N );
    vec3 q0perp = cross( N, q0 );
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max( dot( T, T ), dot( B, B ) );
    float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
    return mat3( T * scale, B * scale, N );
  }
#endif`,L1=`#ifdef USE_CLEARCOAT
  vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,U1=`#ifdef USE_CLEARCOAT_NORMALMAP
  vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
  clearcoatMapN.xy *= clearcoatNormalScale;
  clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,N1=`#ifdef USE_CLEARCOATMAP
  uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform sampler2D clearcoatNormalMap;
  uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform sampler2D clearcoatRoughnessMap;
#endif`,F1=`#ifdef USE_IRIDESCENCEMAP
  uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform sampler2D iridescenceThicknessMap;
#endif`,O1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,z1=`vec3 packNormalToRGB( const in vec3 normal ) {
  return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
  return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
  if( v <= 0.0 )
    return vec4( 0., 0., 0., 0. );
  if( v >= 1.0 )
    return vec4( 1., 1., 1., 1. );
  float vuf;
  float af = modf( v * PackFactors.a, vuf );
  float bf = modf( vuf * ShiftRight8, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
  if( v <= 0.0 )
    return vec3( 0., 0., 0. );
  if( v >= 1.0 )
    return vec3( 1., 1., 1. );
  float vuf;
  float bf = modf( v * PackFactors.b, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
  if( v <= 0.0 )
    return vec2( 0., 0. );
  if( v >= 1.0 )
    return vec2( 1., 1. );
  float vuf;
  float gf = modf( v * 256., vuf );
  return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
  return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
  return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
  return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
  vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
  return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
  return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
  return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
  return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
  return ( near * far ) / ( ( far - near ) * depth - far );
}`,B1=`#ifdef PREMULTIPLIED_ALPHA
  gl_FragColor.rgb *= gl_FragColor.a;
#endif`,k1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,H1=`#ifdef DITHERING
  gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,V1=`#ifdef DITHERING
  vec3 dithering( vec3 color ) {
    float grid_position = rand( gl_FragCoord.xy );
    vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
    dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
    return color + dither_shift_RGB;
  }
#endif`,G1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
  roughnessFactor *= texelRoughness.g;
#endif`,W1=`#ifdef USE_ROUGHNESSMAP
  uniform sampler2D roughnessMap;
#endif`,j1=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
    uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
  float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
    #ifdef USE_REVERSED_DEPTH_BUFFER
      return step( depth, compare );
    #else
      return step( compare, depth );
    #endif
  }
  vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
    return unpackRGBATo2Half( texture2D( shadow, uv ) );
  }
  float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
    float occlusion = 1.0;
    vec2 distribution = texture2DDistribution( shadow, uv );
    #ifdef USE_REVERSED_DEPTH_BUFFER
      float hard_shadow = step( distribution.x, compare );
    #else
      float hard_shadow = step( compare, distribution.x );
    #endif
    if ( hard_shadow != 1.0 ) {
      float distance = compare - distribution.x;
      float variance = max( 0.00000, distribution.y * distribution.y );
      float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
    }
    return occlusion;
  }
  float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
    float shadow = 1.0;
    shadowCoord.xyz /= shadowCoord.w;
    shadowCoord.z += shadowBias;
    bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
    bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
    if ( frustumTest ) {
    #if defined( SHADOWMAP_TYPE_PCF )
      vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
      float dx0 = - texelSize.x * shadowRadius;
      float dy0 = - texelSize.y * shadowRadius;
      float dx1 = + texelSize.x * shadowRadius;
      float dy1 = + texelSize.y * shadowRadius;
      float dx2 = dx0 / 2.0;
      float dy2 = dy0 / 2.0;
      float dx3 = dx1 / 2.0;
      float dy3 = dy1 / 2.0;
      shadow = (
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
      ) * ( 1.0 / 17.0 );
    #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
      vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
      float dx = texelSize.x;
      float dy = texelSize.y;
      vec2 uv = shadowCoord.xy;
      vec2 f = fract( uv * shadowMapSize + 0.5 );
      uv -= f * texelSize;
      shadow = (
        texture2DCompare( shadowMap, uv, shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
        mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
           f.x ) +
        mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
           f.x ) +
        mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
           f.y ) +
        mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
           f.y ) +
        mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
              texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
              f.x ),
           mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
              texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
              f.x ),
           f.y )
      ) * ( 1.0 / 9.0 );
    #elif defined( SHADOWMAP_TYPE_VSM )
      shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
    #else
      shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
    #endif
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
  vec2 cubeToUV( vec3 v, float texelSizeY ) {
    vec3 absV = abs( v );
    float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
    absV *= scaleToCube;
    v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
    vec2 planar = v.xy;
    float almostATexel = 1.5 * texelSizeY;
    float almostOne = 1.0 - almostATexel;
    if ( absV.z >= almostOne ) {
      if ( v.z > 0.0 )
        planar.x = 4.0 - v.x;
    } else if ( absV.x >= almostOne ) {
      float signX = sign( v.x );
      planar.x = v.z * signX + 2.0 * signX;
    } else if ( absV.y >= almostOne ) {
      float signY = sign( v.y );
      planar.x = v.x + 2.0 * signY + 2.0;
      planar.y = v.z * signY - 2.0;
    }
    return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
  }
  float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
    float shadow = 1.0;
    vec3 lightToPosition = shadowCoord.xyz;

    float lightToPositionLength = length( lightToPosition );
    if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
      float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
      vec3 bd3D = normalize( lightToPosition );
      vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
      #if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
        vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
        shadow = (
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
        ) * ( 1.0 / 9.0 );
      #else
        shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
      #endif
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
#endif`,q1=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
    uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
#endif`,X1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
  vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
  vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
  #if NUM_DIR_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
      vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
      vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
    shadowWorldPosition = worldPosition;
    #if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
    #endif
    vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
  }
  #pragma unroll_loop_end
#endif`,Y1=`float getShadowMask() {
  float shadow = 1.0;
  #ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
    directionalLight = directionalLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
    spotLight = spotLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
  PointLightShadow pointLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
    pointLight = pointLightShadows[ i ];
    shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #endif
  return shadow;
}`,$1=`#ifdef USE_SKINNING
  mat4 boneMatX = getBoneMatrix( skinIndex.x );
  mat4 boneMatY = getBoneMatrix( skinIndex.y );
  mat4 boneMatZ = getBoneMatrix( skinIndex.z );
  mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Z1=`#ifdef USE_SKINNING
  uniform mat4 bindMatrix;
  uniform mat4 bindMatrixInverse;
  uniform highp sampler2D boneTexture;
  mat4 getBoneMatrix( const in float i ) {
    int size = textureSize( boneTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
#endif`,K1=`#ifdef USE_SKINNING
  vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
  vec4 skinned = vec4( 0.0 );
  skinned += boneMatX * skinVertex * skinWeight.x;
  skinned += boneMatY * skinVertex * skinWeight.y;
  skinned += boneMatZ * skinVertex * skinWeight.z;
  skinned += boneMatW * skinVertex * skinWeight.w;
  transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,J1=`#ifdef USE_SKINNING
  mat4 skinMatrix = mat4( 0.0 );
  skinMatrix += skinWeight.x * boneMatX;
  skinMatrix += skinWeight.y * boneMatY;
  skinMatrix += skinWeight.z * boneMatZ;
  skinMatrix += skinWeight.w * boneMatW;
  skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
  objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
  #ifdef USE_TANGENT
    objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
  #endif
#endif`,Q1=`float specularStrength;
#ifdef USE_SPECULARMAP
  vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
  specularStrength = texelSpecular.r;
#else
  specularStrength = 1.0;
#endif`,ey=`#ifdef USE_SPECULARMAP
  uniform sampler2D specularMap;
#endif`,ty=`#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ny=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
  return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  color = max( vec3( 0.0 ), color - 0.004 );
  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
  vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
  vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
  return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
  const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
    vec3( 0.04823, 0.01566, 0.83777 )
  );
  const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
    vec3( -0.07367, -0.00605,  1.07602 )
  );
  color *= toneMappingExposure / 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit( color );
  color = ACESOutputMat * color;
  return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
  vec3( 1.6605, - 0.1246, - 0.0182 ),
  vec3( - 0.5876, 1.1329, - 0.1006 ),
  vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
  vec3( 0.6274, 0.0691, 0.0164 ),
  vec3( 0.3293, 0.9195, 0.0880 ),
  vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return + 15.5 * x4 * x2
    - 40.14 * x4 * x
    + 31.96 * x4
    - 6.868 * x2 * x
    + 0.4298 * x2
    + 0.1191 * x
    - 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
  const mat3 AgXInsetMatrix = mat3(
    vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
    vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
    vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
  );
  const mat3 AgXOutsetMatrix = mat3(
    vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
    vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
    vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
  );
  const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
  color *= toneMappingExposure;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = AgXInsetMatrix * color;
  color = max( color, 1e-10 );	color = log2( color );
  color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
  color = clamp( color, 0.0, 1.0 );
  color = agxDefaultContrastApprox( color );
  color = AgXOutsetMatrix * color;
  color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  color = clamp( color, 0.0, 1.0 );
  return color;
}
vec3 NeutralToneMapping( vec3 color ) {
  const float StartCompression = 0.8 - 0.04;
  const float Desaturation = 0.15;
  color *= toneMappingExposure;
  float x = min( color.r, min( color.g, color.b ) );
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max( color.r, max( color.g, color.b ) );
  if ( peak < StartCompression ) return color;
  float d = 1. - StartCompression;
  float newPeak = 1. - d * d / ( peak + d - StartCompression );
  color *= newPeak / peak;
  float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
  return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,iy=`#ifdef USE_TRANSMISSION
  material.transmission = transmission;
  material.transmissionAlpha = 1.0;
  material.thickness = thickness;
  material.attenuationDistance = attenuationDistance;
  material.attenuationColor = attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
  #endif
  #ifdef USE_THICKNESSMAP
    material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
  #endif
  vec3 pos = vWorldPosition;
  vec3 v = normalize( cameraPosition - pos );
  vec3 n = inverseTransformDirection( normal, viewMatrix );
  vec4 transmitted = getIBLVolumeRefraction(
    n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
    pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
    material.attenuationColor, material.attenuationDistance );
  material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
  totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,sy=`#ifdef USE_TRANSMISSION
  uniform float transmission;
  uniform float thickness;
  uniform float attenuationDistance;
  uniform vec3 attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    uniform sampler2D transmissionMap;
  #endif
  #ifdef USE_THICKNESSMAP
    uniform sampler2D thicknessMap;
  #endif
  uniform vec2 transmissionSamplerSize;
  uniform sampler2D transmissionSamplerMap;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vWorldPosition;
  float w0( float a ) {
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
  }
  float w1( float a ) {
    return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
  }
  float w2( float a ){
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
  }
  float w3( float a ) {
    return ( 1.0 / 6.0 ) * ( a * a * a );
  }
  float g0( float a ) {
    return w0( a ) + w1( a );
  }
  float g1( float a ) {
    return w2( a ) + w3( a );
  }
  float h0( float a ) {
    return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
  }
  float h1( float a ) {
    return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
  }
  vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
    uv = uv * texelSize.zw + 0.5;
    vec2 iuv = floor( uv );
    vec2 fuv = fract( uv );
    float g0x = g0( fuv.x );
    float g1x = g1( fuv.x );
    float h0x = h0( fuv.x );
    float h1x = h1( fuv.x );
    float h0y = h0( fuv.y );
    float h1y = h1( fuv.y );
    vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
      g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
  }
  vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
    vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
    vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
    vec2 fLodSizeInv = 1.0 / fLodSize;
    vec2 cLodSizeInv = 1.0 / cLodSize;
    vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
    vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
    return mix( fSample, cSample, fract( lod ) );
  }
  vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
    vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
    vec3 modelScale;
    modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
    modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
    modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
    return normalize( refractionVector ) * thickness * modelScale;
  }
  float applyIorToRoughness( const in float roughness, const in float ior ) {
    return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
  }
  vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
    float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
    return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
  }
  vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
    if ( isinf( attenuationDistance ) ) {
      return vec3( 1.0 );
    } else {
      vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
      vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
    }
  }
  vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
    const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
    const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
    const in vec3 attenuationColor, const in float attenuationDistance ) {
    vec4 transmittedLight;
    vec3 transmittance;
    #ifdef USE_DISPERSION
      float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
      vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
      for ( int i = 0; i < 3; i ++ ) {
        vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
        vec3 refractedRayExit = position + transmissionRay;
        vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
        vec2 refractionCoords = ndcPos.xy / ndcPos.w;
        refractionCoords += 1.0;
        refractionCoords /= 2.0;
        vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
        transmittedLight[ i ] = transmissionSample[ i ];
        transmittedLight.a += transmissionSample.a;
        transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
      }
      transmittedLight.a /= 3.0;
    #else
      vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
      vec3 refractedRayExit = position + transmissionRay;
      vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
      vec2 refractionCoords = ndcPos.xy / ndcPos.w;
      refractionCoords += 1.0;
      refractionCoords /= 2.0;
      transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
      transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
    #endif
    vec3 attenuatedColor = transmittance * transmittedLight.rgb;
    vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
    float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
    return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
  }
#endif`,ry=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,ay=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  uniform mat3 mapTransform;
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  uniform mat3 alphaMapTransform;
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  uniform mat3 lightMapTransform;
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  uniform mat3 aoMapTransform;
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  uniform mat3 bumpMapTransform;
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  uniform mat3 normalMapTransform;
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
  uniform mat3 displacementMapTransform;
  varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapTransform;
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  uniform mat3 metalnessMapTransform;
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  uniform mat3 roughnessMapTransform;
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  uniform mat3 anisotropyMapTransform;
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  uniform mat3 clearcoatMapTransform;
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform mat3 clearcoatNormalMapTransform;
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform mat3 clearcoatRoughnessMapTransform;
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  uniform mat3 sheenColorMapTransform;
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  uniform mat3 sheenRoughnessMapTransform;
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  uniform mat3 iridescenceMapTransform;
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform mat3 iridescenceThicknessMapTransform;
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
  uniform mat3 specularMapTransform;
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  uniform mat3 specularColorMapTransform;
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  uniform mat3 specularIntensityMapTransform;
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,oy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
  vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
  vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
  vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
  vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
  vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
  vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
  vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
  vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
  vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
  vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
  vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
  vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
  vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
  vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
  vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
  vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
  vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
  vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ly=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
#endif`,cy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
  vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,uy=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
  vec4 texColor = texture2D( t2D, vUv );
  #ifdef DECODE_VIDEO_TEXTURE
    texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,hy=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,dy=`#ifdef ENVMAP_TYPE_CUBE
  uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
  uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
  #ifdef ENVMAP_TYPE_CUBE
    vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
  #elif defined( ENVMAP_TYPE_CUBE_UV )
    vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
  #else
    vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,fy=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,py=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
  vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
  gl_FragColor = texColor;
  gl_FragColor.a *= opacity;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,my=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vHighPrecisionZW = gl_Position.zw;
}`,gy=`#if DEPTH_PACKING == 3200
  uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #if DEPTH_PACKING == 3200
    diffuseColor.a = opacity;
  #endif
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <logdepthbuf_fragment>
  #ifdef USE_REVERSED_DEPTH_BUFFER
    float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
  #else
    float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
  #endif
  #if DEPTH_PACKING == 3200
    gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
  #elif DEPTH_PACKING == 3201
    gl_FragColor = packDepthToRGBA( fragCoordZ );
  #elif DEPTH_PACKING == 3202
    gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
  #elif DEPTH_PACKING == 3203
    gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
  #endif
}`,_y=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <worldpos_vertex>
  #include <clipping_planes_vertex>
  vWorldPosition = worldPosition.xyz;
}`,yy=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  float dist = length( vWorldPosition - referencePosition );
  dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
  dist = saturate( dist );
  gl_FragColor = packDepthToRGBA( dist );
}`,xy=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
}`,vy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
  vec3 direction = normalize( vWorldDirection );
  vec2 sampleUV = equirectUv( direction );
  gl_FragColor = texture2D( tEquirect, sampleUV );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,by=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vLineDistance = scale * lineDistance;
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,My=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  if ( mod( vLineDistance, totalSize ) > dashSize ) {
    discard;
  }
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,Sy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <fog_vertex>
}`,wy=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
  #else
    reflectedLight.indirectDiffuse += vec3( 1.0 );
  #endif
  #include <aomap_fragment>
  reflectedLight.indirectDiffuse *= diffuseColor.rgb;
  vec3 outgoingLight = reflectedLight.indirectDiffuse;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Ey=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Ty=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_lambert_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Ay=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
  vViewPosition = - mvPosition.xyz;
}`,Ry=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  vec3 viewDir = normalize( vViewPosition );
  vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
  vec3 y = cross( viewDir, x );
  vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  #ifdef USE_MATCAP
    vec4 matcapColor = texture2D( matcap, uv );
  #else
    vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
  #endif
  vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Cy=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  vViewPosition = - mvPosition.xyz;
#endif
}`,Py=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
  #ifdef OPAQUE
    gl_FragColor.a = 1.0;
  #endif
}`,Iy=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Dy=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_phong_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Ly=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
#ifdef USE_TRANSMISSION
  vWorldPosition = worldPosition.xyz;
#endif
}`,Uy=`#define STANDARD
#ifdef PHYSICAL
  #define IOR
  #define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
  uniform float ior;
#endif
#ifdef USE_SPECULAR
  uniform float specularIntensity;
  uniform vec3 specularColor;
  #ifdef USE_SPECULAR_COLORMAP
    uniform sampler2D specularColorMap;
  #endif
  #ifdef USE_SPECULAR_INTENSITYMAP
    uniform sampler2D specularIntensityMap;
  #endif
#endif
#ifdef USE_CLEARCOAT
  uniform float clearcoat;
  uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
  uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
  uniform float iridescence;
  uniform float iridescenceIOR;
  uniform float iridescenceThicknessMinimum;
  uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
  uniform vec3 sheenColor;
  uniform float sheenRoughness;
  #ifdef USE_SHEEN_COLORMAP
    uniform sampler2D sheenColorMap;
  #endif
  #ifdef USE_SHEEN_ROUGHNESSMAP
    uniform sampler2D sheenRoughnessMap;
  #endif
#endif
#ifdef USE_ANISOTROPY
  uniform vec2 anisotropyVector;
  #ifdef USE_ANISOTROPYMAP
    uniform sampler2D anisotropyMap;
  #endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <roughnessmap_fragment>
  #include <metalnessmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <clearcoat_normal_fragment_begin>
  #include <clearcoat_normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_physical_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
  #ifdef USE_SHEEN
    float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
    outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
  #endif
  #ifdef USE_CLEARCOAT
    float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
    vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
  #endif
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Ny=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Fy=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_toon_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Oy=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
  varying vec2 vUv;
  uniform mat3 uvTransform;
#endif
void main() {
  #ifdef USE_POINTS_UV
    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  #endif
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  gl_PointSize = size;
  #ifdef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
  #endif
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>
}`,zy=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_particle_fragment>
  #include <color_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,By=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,ky=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Hy=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  vec4 mvPosition = modelViewMatrix[ 3 ];
  vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
  #ifndef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) scale *= - mvPosition.z;
  #endif
  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,Vy=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,qe={alphahash_fragment:u_,alphahash_pars_fragment:h_,alphamap_fragment:d_,alphamap_pars_fragment:f_,alphatest_fragment:p_,alphatest_pars_fragment:m_,aomap_fragment:g_,aomap_pars_fragment:__,batching_pars_vertex:y_,batching_vertex:x_,begin_vertex:v_,beginnormal_vertex:b_,bsdfs:M_,iridescence_fragment:S_,bumpmap_pars_fragment:w_,clipping_planes_fragment:E_,clipping_planes_pars_fragment:T_,clipping_planes_pars_vertex:A_,clipping_planes_vertex:R_,color_fragment:C_,color_pars_fragment:P_,color_pars_vertex:I_,color_vertex:D_,common:L_,cube_uv_reflection_fragment:U_,defaultnormal_vertex:N_,displacementmap_pars_vertex:F_,displacementmap_vertex:O_,emissivemap_fragment:z_,emissivemap_pars_fragment:B_,colorspace_fragment:k_,colorspace_pars_fragment:H_,envmap_fragment:V_,envmap_common_pars_fragment:G_,envmap_pars_fragment:W_,envmap_pars_vertex:j_,envmap_physical_pars_fragment:n1,envmap_vertex:q_,fog_vertex:X_,fog_pars_vertex:Y_,fog_fragment:$_,fog_pars_fragment:Z_,gradientmap_pars_fragment:K_,lightmap_pars_fragment:J_,lights_lambert_fragment:Q_,lights_lambert_pars_fragment:e1,lights_pars_begin:t1,lights_toon_fragment:i1,lights_toon_pars_fragment:s1,lights_phong_fragment:r1,lights_phong_pars_fragment:a1,lights_physical_fragment:o1,lights_physical_pars_fragment:l1,lights_fragment_begin:c1,lights_fragment_maps:u1,lights_fragment_end:h1,logdepthbuf_fragment:d1,logdepthbuf_pars_fragment:f1,logdepthbuf_pars_vertex:p1,logdepthbuf_vertex:m1,map_fragment:g1,map_pars_fragment:_1,map_particle_fragment:y1,map_particle_pars_fragment:x1,metalnessmap_fragment:v1,metalnessmap_pars_fragment:b1,morphinstance_vertex:M1,morphcolor_vertex:S1,morphnormal_vertex:w1,morphtarget_pars_vertex:E1,morphtarget_vertex:T1,normal_fragment_begin:A1,normal_fragment_maps:R1,normal_pars_fragment:C1,normal_pars_vertex:P1,normal_vertex:I1,normalmap_pars_fragment:D1,clearcoat_normal_fragment_begin:L1,clearcoat_normal_fragment_maps:U1,clearcoat_pars_fragment:N1,iridescence_pars_fragment:F1,opaque_fragment:O1,packing:z1,premultiplied_alpha_fragment:B1,project_vertex:k1,dithering_fragment:H1,dithering_pars_fragment:V1,roughnessmap_fragment:G1,roughnessmap_pars_fragment:W1,shadowmap_pars_fragment:j1,shadowmap_pars_vertex:q1,shadowmap_vertex:X1,shadowmask_pars_fragment:Y1,skinbase_vertex:$1,skinning_pars_vertex:Z1,skinning_vertex:K1,skinnormal_vertex:J1,specularmap_fragment:Q1,specularmap_pars_fragment:ey,tonemapping_fragment:ty,tonemapping_pars_fragment:ny,transmission_fragment:iy,transmission_pars_fragment:sy,uv_pars_fragment:ry,uv_pars_vertex:ay,uv_vertex:oy,worldpos_vertex:ly,background_vert:cy,background_frag:uy,backgroundCube_vert:hy,backgroundCube_frag:dy,cube_vert:fy,cube_frag:py,depth_vert:my,depth_frag:gy,distanceRGBA_vert:_y,distanceRGBA_frag:yy,equirect_vert:xy,equirect_frag:vy,linedashed_vert:by,linedashed_frag:My,meshbasic_vert:Sy,meshbasic_frag:wy,meshlambert_vert:Ey,meshlambert_frag:Ty,meshmatcap_vert:Ay,meshmatcap_frag:Ry,meshnormal_vert:Cy,meshnormal_frag:Py,meshphong_vert:Iy,meshphong_frag:Dy,meshphysical_vert:Ly,meshphysical_frag:Uy,meshtoon_vert:Ny,meshtoon_frag:Fy,points_vert:Oy,points_frag:zy,shadow_vert:By,shadow_frag:ky,sprite_vert:Hy,sprite_frag:Vy},be={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},mi={basic:{uniforms:un([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:un([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new De(0)}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:un([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:un([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:un([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new De(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:un([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:un([be.points,be.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:un([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:un([be.common,be.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:un([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:un([be.sprite,be.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distanceRGBA:{uniforms:un([be.common,be.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distanceRGBA_vert,fragmentShader:qe.distanceRGBA_frag},shadow:{uniforms:un([be.lights,be.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};mi.physical={uniforms:un([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var Ec={r:0,b:0,g:0},Gs=new ei,Gy=new Ce;function Wy(i,e,t,n,s,r,a){let o=new De(0),l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(x){let y=x.isScene===!0?x.background:null;return y&&y.isTexture&&(y=(x.backgroundBlurriness>0?t:e).get(y)),y}function _(x){let y=!1,w=g(x);w===null?p(o,l):w&&w.isColor&&(p(w,1),y=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,a):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,y){let w=g(y);w&&(w.isCubeTexture||w.mapping===Za)?(u===void 0&&(u=new it(new Qi(1,1,1),new St({name:"BackgroundCubeMaterial",uniforms:Vs(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,P,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Gs.copy(y.backgroundRotation),Gs.x*=-1,Gs.y*=-1,Gs.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Gs.y*=-1,Gs.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Gy.makeRotationFromEuler(Gs)),u.material.toneMapped=Je.getTransfer(w.colorSpace)!==ht,(h!==w||d!==w.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=w,d=w.version,f=i.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new it(new Li(2,2),new St({name:"BackgroundMaterial",uniforms:Vs(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Je.getTransfer(w.colorSpace)!==ht,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||d!==w.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=w,d=w.version,f=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,y){x.getRGB(Ec,Mh(i)),n.buffers.color.setClear(Ec.r,Ec.g,Ec.b,y,a)}function M(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:_,addToRenderList:m,dispose:M}}function jy(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(b,R,L,F,z){let V=!1,B=h(F,L,R);r!==B&&(r=B,c(r.object)),V=f(b,F,L,z),V&&g(b,F,L,z),z!==null&&e.update(z,i.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,y(b,R,L,F),z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function u(b){return i.deleteVertexArray(b)}function h(b,R,L){let F=L.wireframe===!0,z=n[b.id];z===void 0&&(z={},n[b.id]=z);let V=z[R.id];V===void 0&&(V={},z[R.id]=V);let B=V[F];return B===void 0&&(B=d(l()),V[F]=B),B}function d(b){let R=[],L=[],F=[];for(let z=0;z<t;z++)R[z]=0,L[z]=0,F[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:L,attributeDivisors:F,object:b,attributes:{},index:null}}function f(b,R,L,F){let z=r.attributes,V=R.attributes,B=0,ne=L.getAttributes();for(let G in ne)if(ne[G].location>=0){let ce=z[G],Me=V[G];if(Me===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(Me=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(Me=b.instanceColor)),ce===void 0||ce.attribute!==Me||Me&&ce.data!==Me.data)return!0;B++}return r.attributesNum!==B||r.index!==F}function g(b,R,L,F){let z={},V=R.attributes,B=0,ne=L.getAttributes();for(let G in ne)if(ne[G].location>=0){let ce=V[G];ce===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(ce=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(ce=b.instanceColor));let Me={};Me.attribute=ce,ce&&ce.data&&(Me.data=ce.data),z[G]=Me,B++}r.attributes=z,r.attributesNum=B,r.index=F}function _(){let b=r.newAttributes;for(let R=0,L=b.length;R<L;R++)b[R]=0}function m(b){p(b,0)}function p(b,R){let L=r.newAttributes,F=r.enabledAttributes,z=r.attributeDivisors;L[b]=1,F[b]===0&&(i.enableVertexAttribArray(b),F[b]=1),z[b]!==R&&(i.vertexAttribDivisor(b,R),z[b]=R)}function M(){let b=r.newAttributes,R=r.enabledAttributes;for(let L=0,F=R.length;L<F;L++)R[L]!==b[L]&&(i.disableVertexAttribArray(L),R[L]=0)}function x(b,R,L,F,z,V,B){B===!0?i.vertexAttribIPointer(b,R,L,z,V):i.vertexAttribPointer(b,R,L,F,z,V)}function y(b,R,L,F){_();let z=F.attributes,V=L.getAttributes(),B=R.defaultAttributeValues;for(let ne in V){let G=V[ne];if(G.location>=0){let le=z[ne];if(le===void 0&&(ne==="instanceMatrix"&&b.instanceMatrix&&(le=b.instanceMatrix),ne==="instanceColor"&&b.instanceColor&&(le=b.instanceColor)),le!==void 0){let ce=le.normalized,Me=le.itemSize,Re=e.get(le);if(Re===void 0)continue;let Fe=Re.buffer,Ve=Re.type,pe=Re.bytesPerElement,q=Ve===i.INT||Ve===i.UNSIGNED_INT||le.gpuType===Gl;if(le.isInterleavedBufferAttribute){let Z=le.data,me=Z.stride,Ee=le.offset;if(Z.isInstancedInterleavedBuffer){for(let ye=0;ye<G.locationSize;ye++)p(G.location+ye,Z.meshPerAttribute);b.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let ye=0;ye<G.locationSize;ye++)m(G.location+ye);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let ye=0;ye<G.locationSize;ye++)x(G.location+ye,Me/G.locationSize,Ve,ce,me*pe,(Ee+Me/G.locationSize*ye)*pe,q)}else{if(le.isInstancedBufferAttribute){for(let Z=0;Z<G.locationSize;Z++)p(G.location+Z,le.meshPerAttribute);b.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Z=0;Z<G.locationSize;Z++)m(G.location+Z);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let Z=0;Z<G.locationSize;Z++)x(G.location+Z,Me/G.locationSize,Ve,ce,Me*pe,Me/G.locationSize*Z*pe,q)}}else if(B!==void 0){let ce=B[ne];if(ce!==void 0)switch(ce.length){case 2:i.vertexAttrib2fv(G.location,ce);break;case 3:i.vertexAttrib3fv(G.location,ce);break;case 4:i.vertexAttrib4fv(G.location,ce);break;default:i.vertexAttrib1fv(G.location,ce)}}}}M()}function w(){A();for(let b in n){let R=n[b];for(let L in R){let F=R[L];for(let z in F)u(F[z].object),delete F[z];delete R[L]}delete n[b]}}function T(b){if(n[b.id]===void 0)return;let R=n[b.id];for(let L in R){let F=R[L];for(let z in F)u(F[z].object),delete F[z];delete R[L]}delete n[b.id]}function P(b){for(let R in n){let L=n[R];if(L[b.id]===void 0)continue;let F=L[b.id];for(let z in F)u(F[z].object),delete F[z];delete L[b.id]}}function A(){S(),a=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:S,dispose:w,releaseStatesOfGeometry:T,releaseStatesOfProgram:P,initAttributes:_,enableAttribute:m,disableUnusedAttributes:M}}function qy(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function a(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function o(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,n,1)}function l(c,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)a(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Xy(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==_n&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let A=P===Ut&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==Nn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==cn&&!A)}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),x=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:x,maxFragmentUniforms:y,vertexTextures:w,maxSamples:T}}function Yy(i){let e=this,t=null,n=0,s=!1,r=!1,a=new on,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let M=r?0:n,x=M*4,y=p.clippingState||null;l.value=y,y=u(g,d,x,f);for(let w=0;w!==x;++w)y[w]=t[w];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,y=f;x!==_;++x,y+=4)a.copy(h[x]).applyMatrix4(M,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function $y(i){let e=new WeakMap;function t(a,o){return o===Lr?a.mapping=Bs:o===Hl&&(a.mapping=ks),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Lr||o===Hl)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new br(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var zr=4,Op=[.125,.215,.35,.446,.526,.582],qs=20,Ah=new Oi,zp=new De,Rh=null,Ch=0,Ph=0,Ih=!1,js=(1+Math.sqrt(5))/2,Or=1/js,Bp=[new C(-js,Or,0),new C(js,Or,0),new C(-Or,0,js),new C(Or,0,js),new C(0,js,-Or),new C(0,js,Or),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)],Zy=new C,kr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Zy}=r;Rh=this._renderer.getRenderTarget(),Ch=this._renderer.getActiveCubeFace(),Ph=this._renderer.getActiveMipmapLevel(),Ih=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Rh,Ch,Ph),this._renderer.xr.enabled=Ih,e.scissorTest=!1,Tc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Bs||e.mapping===ks?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Rh=this._renderer.getRenderTarget(),Ch=this._renderer.getActiveCubeFace(),Ph=this._renderer.getActiveMipmapLevel(),Ih=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Lt,minFilter:Lt,generateMipmaps:!1,type:Ut,format:_n,colorSpace:Ht,depthBuffer:!1},s=kp(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=kp(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ky(r)),this._blurMaterial=Jy(r,e,t)}return s}_compileMaterial(e){let t=new it(this._lodPlanes[0],e);this._renderer.compile(t,Ah)}_sceneToCubeUV(e,t,n,s,r){let l=new Dt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(zp),h.toneMapping=Bi,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));let _=new Jt({name:"PMREM.Background",side:Qt,depthWrite:!1,depthTest:!1}),m=new it(new Qi,_),p=!1,M=e.background;M?M.isColor&&(_.color.copy(M),e.background=null,p=!0):(_.color.copy(zp),p=!0);for(let x=0;x<6;x++){let y=x%3;y===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[x],r.y,r.z)):y===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[x]));let w=this._cubeSize;Tc(s,y*w,x>2?w:0,w,w),h.setRenderTarget(s),p&&h.render(m,l),h.render(e,l)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=M}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Bs||e.mapping===ks;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Hp());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new it(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Tc(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Ah)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Bp[(s-r-1)%Bp.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new it(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*qs-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):qs;m>qs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${qs}`);let p=[],M=0;for(let P=0;P<qs;++P){let A=P/_,S=Math.exp(-A*A/2);p.push(S),P===0?M+=S:P<m&&(M+=2*S)}for(let P=0;P<p.length;P++)p[P]=p[P]/M;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let y=this._sizeLods[s],w=3*y*(s>x-zr?s-x+zr:0),T=4*(this._cubeSize-y);Tc(t,w,T,3*y,2*y),l.setRenderTarget(t),l.render(h,Ah)}};function Ky(i){let e=[],t=[],n=[],s=i,r=i-zr+1+Op.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;a>i-zr?l=Op[a-i+zr-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,M=new Float32Array(_*g*f),x=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let T=0;T<f;T++){let P=T%3*2/3-1,A=T>2?0:-1,S=[P,A,0,P+2/3,A,0,P+2/3,A+1,0,P,A,0,P+2/3,A+1,0,P,A+1,0];M.set(S,_*g*T),x.set(d,m*g*T);let b=[T,T,T,T,T,T];y.set(b,p*g*T)}let w=new gt;w.setAttribute("position",new ct(M,_)),w.setAttribute("uv",new ct(x,m)),w.setAttribute("faceIndex",new ct(y,p)),e.push(w),s>zr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function kp(i,e,t){let n=new Vt(i,e,t);return n.texture.mapping=Za,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Tc(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Jy(i,e,t){let n=new Float32Array(qs),s=new C(0,1,0);return new St({name:"SphericalGaussianBlur",defines:{n:qs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Hh(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      varying vec3 vOutputDirection;

      uniform sampler2D envMap;
      uniform int samples;
      uniform float weights[ n ];
      uniform bool latitudinal;
      uniform float dTheta;
      uniform float mipInt;
      uniform vec3 poleAxis;

      #define ENVMAP_TYPE_CUBE_UV
      #include <cube_uv_reflection_fragment>

      vec3 getSample( float theta, vec3 axis ) {

        float cosTheta = cos( theta );
        // Rodrigues' axis-angle rotation
        vec3 sampleDirection = vOutputDirection * cosTheta
          + cross( axis, vOutputDirection ) * sin( theta )
          + axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

        return bilinearCubeUV( envMap, sampleDirection, mipInt );

      }

      void main() {

        vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

        if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

          axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

        }

        axis = normalize( axis );

        gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
        gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

        for ( int i = 1; i < n; i++ ) {

          if ( i >= samples ) {

            break;

          }

          float theta = dTheta * float( i );
          gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
          gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

        }

      }
    `,blending:Ot,depthTest:!1,depthWrite:!1})}function Hp(){return new St({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Hh(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      varying vec3 vOutputDirection;

      uniform sampler2D envMap;

      #include <common>

      void main() {

        vec3 outputDirection = normalize( vOutputDirection );
        vec2 uv = equirectUv( outputDirection );

        gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

      }
    `,blending:Ot,depthTest:!1,depthWrite:!1})}function Vp(){return new St({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Hh(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      uniform float flipEnvMap;

      varying vec3 vOutputDirection;

      uniform samplerCube envMap;

      void main() {

        gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

      }
    `,blending:Ot,depthTest:!1,depthWrite:!1})}function Hh(){return`

    precision mediump float;
    precision mediump int;

    attribute float faceIndex;

    varying vec3 vOutputDirection;

    // RH coordinate system; PMREM face-indexing convention
    vec3 getDirection( vec2 uv, float face ) {

      uv = 2.0 * uv - 1.0;

      vec3 direction = vec3( uv, 1.0 );

      if ( face == 0.0 ) {

        direction = direction.zyx; // ( 1, v, u ) pos x

      } else if ( face == 1.0 ) {

        direction = direction.xzy;
        direction.xz *= -1.0; // ( -u, 1, -v ) pos y

      } else if ( face == 2.0 ) {

        direction.x *= -1.0; // ( -u, v, 1 ) pos z

      } else if ( face == 3.0 ) {

        direction = direction.zyx;
        direction.xz *= -1.0; // ( -1, v, -u ) neg x

      } else if ( face == 4.0 ) {

        direction = direction.xzy;
        direction.xy *= -1.0; // ( -u, -1, v ) neg y

      } else if ( face == 5.0 ) {

        direction.z *= -1.0; // ( u, v, -1 ) neg z

      }

      return direction;

    }

    void main() {

      vOutputDirection = getDirection( uv, faceIndex );
      gl_Position = vec4( position, 1.0 );

    }
  `}function Qy(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===Lr||l===Hl,u=l===Bs||l===ks;if(c||u){let h=e.get(o),d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new kr(i)),h=c?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{let f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new kr(i)),h=c?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",r),h.texture):null}}}return o}function s(o){let l=0,c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function ex(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&_r("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function tx(i,e,t,n){let s={},r=new WeakMap;function a(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let M=f.array;_=f.version;for(let x=0,y=M.length;x<y;x+=3){let w=M[x+0],T=M[x+1],P=M[x+2];d.push(w,T,T,P,P,w)}}else if(g!==void 0){let M=g.array;_=g.version;for(let x=0,y=M.length/3-1;x<y;x+=3){let w=x+0,T=x+1,P=x+2;d.push(w,T,T,P,P,w)}}else return;let m=new(bh(d)?ma:pa)(d,1);m.version=_;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function nx(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*a),t.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*a,g),t.update(f,n,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function h(d,f,g,_){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let M=0;M<g;M++)p+=f[M]*_[M];t.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ix(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function sx(i,e,t){let n=new WeakMap,s=new nt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,d=n.get(o);if(d===void 0||d.count!==h){let S=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],x=0;f===!0&&(x=1),g===!0&&(x=2),_===!0&&(x=3);let y=o.attributes.position.count*x,w=1;y>e.maxTextureSize&&(w=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let T=new Float32Array(y*w*4*h),P=new fa(T,y,w,h);P.type=cn,P.needsUpdate=!0;let A=x*4;for(let b=0;b<h;b++){let R=m[b],L=p[b],F=M[b],z=y*w*4*b;for(let V=0;V<R.count;V++){let B=V*A;f===!0&&(s.fromBufferAttribute(R,V),T[z+B+0]=s.x,T[z+B+1]=s.y,T[z+B+2]=s.z,T[z+B+3]=0),g===!0&&(s.fromBufferAttribute(L,V),T[z+B+4]=s.x,T[z+B+5]=s.y,T[z+B+6]=s.z,T[z+B+7]=0),_===!0&&(s.fromBufferAttribute(F,V),T[z+B+8]=s.x,T[z+B+9]=s.y,T[z+B+10]=s.z,T[z+B+11]=F.itemSize===4?s.w:1)}}d={count:h,texture:P,size:new he(y,w)},n.set(o,d),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function rx(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}var om=new $t,Gp=new Ps(1,1),lm=new fa,cm=new ll,um=new _a,Wp=[],jp=[],qp=new Float32Array(16),Xp=new Float32Array(9),Yp=new Float32Array(4);function Hr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Wp[s];if(r===void 0&&(r=new Float32Array(s),Wp[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function jt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function qt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Cc(i,e){let t=jp[e];t===void 0&&(t=new Int32Array(e),jp[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ax(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ox(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2fv(this.addr,e),qt(t,e)}}function lx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(jt(t,e))return;i.uniform3fv(this.addr,e),qt(t,e)}}function cx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4fv(this.addr,e),qt(t,e)}}function ux(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;Yp.set(n),i.uniformMatrix2fv(this.addr,!1,Yp),qt(t,n)}}function hx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;Xp.set(n),i.uniformMatrix3fv(this.addr,!1,Xp),qt(t,n)}}function dx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;qp.set(n),i.uniformMatrix4fv(this.addr,!1,qp),qt(t,n)}}function fx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function px(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2iv(this.addr,e),qt(t,e)}}function mx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;i.uniform3iv(this.addr,e),qt(t,e)}}function gx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4iv(this.addr,e),qt(t,e)}}function _x(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function yx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2uiv(this.addr,e),qt(t,e)}}function xx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;i.uniform3uiv(this.addr,e),qt(t,e)}}function vx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4uiv(this.addr,e),qt(t,e)}}function bx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Gp.compareFunction=_h,r=Gp):r=om,t.setTexture2D(e||r,s)}function Mx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||cm,s)}function Sx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||um,s)}function wx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||lm,s)}function Ex(i){switch(i){case 5126:return ax;case 35664:return ox;case 35665:return lx;case 35666:return cx;case 35674:return ux;case 35675:return hx;case 35676:return dx;case 5124:case 35670:return fx;case 35667:case 35671:return px;case 35668:case 35672:return mx;case 35669:case 35673:return gx;case 5125:return _x;case 36294:return yx;case 36295:return xx;case 36296:return vx;case 35678:case 36198:case 36298:case 36306:case 35682:return bx;case 35679:case 36299:case 36307:return Mx;case 35680:case 36300:case 36308:case 36293:return Sx;case 36289:case 36303:case 36311:case 36292:return wx}}function Tx(i,e){i.uniform1fv(this.addr,e)}function Ax(i,e){let t=Hr(e,this.size,2);i.uniform2fv(this.addr,t)}function Rx(i,e){let t=Hr(e,this.size,3);i.uniform3fv(this.addr,t)}function Cx(i,e){let t=Hr(e,this.size,4);i.uniform4fv(this.addr,t)}function Px(i,e){let t=Hr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Ix(i,e){let t=Hr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Dx(i,e){let t=Hr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Lx(i,e){i.uniform1iv(this.addr,e)}function Ux(i,e){i.uniform2iv(this.addr,e)}function Nx(i,e){i.uniform3iv(this.addr,e)}function Fx(i,e){i.uniform4iv(this.addr,e)}function Ox(i,e){i.uniform1uiv(this.addr,e)}function zx(i,e){i.uniform2uiv(this.addr,e)}function Bx(i,e){i.uniform3uiv(this.addr,e)}function kx(i,e){i.uniform4uiv(this.addr,e)}function Hx(i,e,t){let n=this.cache,s=e.length,r=Cc(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||om,r[a])}function Vx(i,e,t){let n=this.cache,s=e.length,r=Cc(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||cm,r[a])}function Gx(i,e,t){let n=this.cache,s=e.length,r=Cc(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||um,r[a])}function Wx(i,e,t){let n=this.cache,s=e.length,r=Cc(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||lm,r[a])}function jx(i){switch(i){case 5126:return Tx;case 35664:return Ax;case 35665:return Rx;case 35666:return Cx;case 35674:return Px;case 35675:return Ix;case 35676:return Dx;case 5124:case 35670:return Lx;case 35667:case 35671:return Ux;case 35668:case 35672:return Nx;case 35669:case 35673:return Fx;case 5125:return Ox;case 36294:return zx;case 36295:return Bx;case 36296:return kx;case 35678:case 36198:case 36298:case 36306:case 35682:return Hx;case 35679:case 36299:case 36307:return Vx;case 35680:case 36300:case 36308:case 36293:return Gx;case 36289:case 36303:case 36311:case 36292:return Wx}}var Lh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ex(t.type)}},Uh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=jx(t.type)}},Nh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Dh=/(\w+)(\])?(\[|\.)?/g;function $p(i,e){i.seq.push(e),i.map[e.id]=e}function qx(i,e,t){let n=i.name,s=n.length;for(Dh.lastIndex=0;;){let r=Dh.exec(n),a=Dh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){$p(t,c===void 0?new Lh(o,i,e):new Uh(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new Nh(o),$p(t,h)),t=h}}}var Br=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);qx(r,a,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Zp(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Xx=37297,Yx=0;function $x(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Kp=new Ye;function Zx(i){Je._getMatrix(Kp,Je.workingColorSpace,i);let e=`mat3( ${Kp.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(i)){case ha:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Jp(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+$x(i.getShaderSource(e),o)}else return r}function Kx(i,e){let t=Zx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Jx(i,e){let t;switch(e){case Nl:t="Linear";break;case Fl:t="Reinhard";break;case Ol:t="Cineon";break;case Dr:t="ACESFilmic";break;case Bl:t="AgX";break;case kl:t="Neutral";break;case zl:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ac=new C;function Qx(){Je.getLuminanceCoefficients(Ac);let i=Ac.x.toFixed(4),e=Ac.y.toFixed(4),t=Ac.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ev(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(no).join(`
`)}function tv(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function nv(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function no(i){return i!==""}function Qp(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function em(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var iv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fh(i){return i.replace(iv,rv)}var sv=new Map;function rv(i,e){let t=qe[e];if(t===void 0){let n=sv.get(e);if(n!==void 0)t=qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Fh(t)}var av=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tm(i){return i.replace(av,ov)}function ov(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function nm(i){let e=`precision ${i.precision} float;
  precision ${i.precision} int;
  precision ${i.precision} sampler2D;
  precision ${i.precision} samplerCube;
  precision ${i.precision} sampler3D;
  precision ${i.precision} sampler2DArray;
  precision ${i.precision} sampler2DShadow;
  precision ${i.precision} samplerCubeShadow;
  precision ${i.precision} sampler2DArrayShadow;
  precision ${i.precision} isampler2D;
  precision ${i.precision} isampler3D;
  precision ${i.precision} isamplerCube;
  precision ${i.precision} isampler2DArray;
  precision ${i.precision} usampler2D;
  precision ${i.precision} usampler3D;
  precision ${i.precision} usamplerCube;
  precision ${i.precision} usampler2DArray;
  `;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function lv(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Xa?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Qf?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===pi&&(e="SHADOWMAP_TYPE_VSM"),e}function cv(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Bs:case ks:e="ENVMAP_TYPE_CUBE";break;case Za:e="ENVMAP_TYPE_CUBE_UV";break}return e}function uv(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case ks:e="ENVMAP_MODE_REFRACTION";break}return e}function hv(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case oh:e="ENVMAP_BLENDING_MULTIPLY";break;case pp:e="ENVMAP_BLENDING_MIX";break;case mp:e="ENVMAP_BLENDING_ADD";break}return e}function dv(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function fv(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=lv(t),c=cv(t),u=uv(t),h=hv(t),d=dv(t),f=ev(t),g=tv(r),_=s.createProgram(),m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(no).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(no).join(`
`),p.length>0&&(p+=`
`)):(m=[nm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(no).join(`
`),p=[nm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Bi?"#define TONE_MAPPING":"",t.toneMapping!==Bi?qe.tonemapping_pars_fragment:"",t.toneMapping!==Bi?Jx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,Kx("linearToOutputTexel",t.outputColorSpace),Qx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(no).join(`
`)),a=Fh(a),a=Qp(a,t),a=em(a,t),o=Fh(o),o=Qp(o,t),o=em(o,t),a=tm(a),o=tm(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===xh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===xh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let x=M+m+a,y=M+p+o,w=Zp(s,s.VERTEX_SHADER,x),T=Zp(s,s.FRAGMENT_SHADER,y);s.attachShader(_,w),s.attachShader(_,T),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function P(R){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(_)||"",F=s.getShaderInfoLog(w)||"",z=s.getShaderInfoLog(T)||"",V=L.trim(),B=F.trim(),ne=z.trim(),G=!0,le=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,w,T);else{let ce=Jp(s,w,"vertex"),Me=Jp(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+V+`
`+ce+`
`+Me)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(B===""||ne==="")&&(le=!1);le&&(R.diagnostics={runnable:G,programLog:V,vertexShader:{log:B,prefix:m},fragmentShader:{log:ne,prefix:p}})}s.deleteShader(w),s.deleteShader(T),A=new Br(s,_),S=nv(s,_)}let A;this.getUniforms=function(){return A===void 0&&P(this),A};let S;this.getAttributes=function(){return S===void 0&&P(this),S};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(_,Xx)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Yx++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=T,this}var pv=0,Oh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new zh(e),t.set(e,n)),n}},zh=class{constructor(e){this.id=pv++,this.code=e,this.usedTimes=0}};function mv(i,e,t,n,s,r,a){let o=new xr,l=new Oh,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,b,R,L,F){let z=L.fog,V=F.geometry,B=S.isMeshStandardMaterial?L.environment:null,ne=(S.isMeshStandardMaterial?t:e).get(S.envMap||B),G=ne&&ne.mapping===Za?ne.image.height:null,le=g[S.type];S.precision!==null&&(f=s.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));let ce=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Me=ce!==void 0?ce.length:0,Re=0;V.morphAttributes.position!==void 0&&(Re=1),V.morphAttributes.normal!==void 0&&(Re=2),V.morphAttributes.color!==void 0&&(Re=3);let Fe,Ve,pe,q;if(le){let rt=mi[le];Fe=rt.vertexShader,Ve=rt.fragmentShader}else Fe=S.vertexShader,Ve=S.fragmentShader,l.update(S),pe=l.getVertexShaderID(S),q=l.getFragmentShaderID(S);let Z=i.getRenderTarget(),me=i.state.buffers.depth.getReversed(),Ee=F.isInstancedMesh===!0,ye=F.isBatchedMesh===!0,Le=!!S.map,dt=!!S.matcap,U=!!ne,at=!!S.aoMap,ze=!!S.lightMap,Y=!!S.bumpMap,ue=!!S.normalMap,ke=!!S.displacementMap,fe=!!S.emissiveMap,Ie=!!S.metalnessMap,$e=!!S.roughnessMap,Ze=S.anisotropy>0,D=S.clearcoat>0,v=S.dispersion>0,O=S.iridescence>0,J=S.sheen>0,ee=S.transmission>0,W=Ze&&!!S.anisotropyMap,_e=D&&!!S.clearcoatMap,oe=D&&!!S.clearcoatNormalMap,xe=D&&!!S.clearcoatRoughnessMap,ge=O&&!!S.iridescenceMap,re=O&&!!S.iridescenceThicknessMap,ve=J&&!!S.sheenColorMap,Ue=J&&!!S.sheenRoughnessMap,Te=!!S.specularMap,N=!!S.specularColorMap,X=!!S.specularIntensityMap,I=ee&&!!S.transmissionMap,j=ee&&!!S.thicknessMap,ie=!!S.gradientMap,se=!!S.alphaMap,ae=S.alphaTest>0,te=!!S.alphaHash,we=!!S.extensions,Ne=Bi;S.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Ne=i.toneMapping);let ot={shaderID:le,shaderType:S.type,shaderName:S.name,vertexShader:Fe,fragmentShader:Ve,defines:S.defines,customVertexShaderID:pe,customFragmentShaderID:q,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:ye,batchingColor:ye&&F._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&F.instanceColor!==null,instancingMorph:Ee&&F.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Z===null?i.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:Ht,alphaToCoverage:!!S.alphaToCoverage,map:Le,matcap:dt,envMap:U,envMapMode:U&&ne.mapping,envMapCubeUVHeight:G,aoMap:at,lightMap:ze,bumpMap:Y,normalMap:ue,displacementMap:d&&ke,emissiveMap:fe,normalMapObjectSpace:ue&&S.normalMapType===vp,normalMapTangentSpace:ue&&S.normalMapType===wc,metalnessMap:Ie,roughnessMap:$e,anisotropy:Ze,anisotropyMap:W,clearcoat:D,clearcoatMap:_e,clearcoatNormalMap:oe,clearcoatRoughnessMap:xe,dispersion:v,iridescence:O,iridescenceMap:ge,iridescenceThicknessMap:re,sheen:J,sheenColorMap:ve,sheenRoughnessMap:Ue,specularMap:Te,specularColorMap:N,specularIntensityMap:X,transmission:ee,transmissionMap:I,thicknessMap:j,gradientMap:ie,opaque:S.transparent===!1&&S.blending===Ss&&S.alphaToCoverage===!1,alphaMap:se,alphaTest:ae,alphaHash:te,combine:S.combine,mapUv:Le&&_(S.map.channel),aoMapUv:at&&_(S.aoMap.channel),lightMapUv:ze&&_(S.lightMap.channel),bumpMapUv:Y&&_(S.bumpMap.channel),normalMapUv:ue&&_(S.normalMap.channel),displacementMapUv:ke&&_(S.displacementMap.channel),emissiveMapUv:fe&&_(S.emissiveMap.channel),metalnessMapUv:Ie&&_(S.metalnessMap.channel),roughnessMapUv:$e&&_(S.roughnessMap.channel),anisotropyMapUv:W&&_(S.anisotropyMap.channel),clearcoatMapUv:_e&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:oe&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ge&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:re&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Ue&&_(S.sheenRoughnessMap.channel),specularMapUv:Te&&_(S.specularMap.channel),specularColorMapUv:N&&_(S.specularColorMap.channel),specularIntensityMapUv:X&&_(S.specularIntensityMap.channel),transmissionMapUv:I&&_(S.transmissionMap.channel),thicknessMapUv:j&&_(S.thicknessMap.channel),alphaMapUv:se&&_(S.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(ue||Ze),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!V.attributes.uv&&(Le||se),fog:!!z,useFog:S.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:me,skinning:F.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Re,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ne,decodeVideoTexture:Le&&S.map.isVideoTexture===!0&&Je.getTransfer(S.map.colorSpace)===ht,decodeVideoTextureEmissive:fe&&S.emissiveMap.isVideoTexture===!0&&Je.getTransfer(S.emissiveMap.colorSpace)===ht,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Mn,flipSided:S.side===Qt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:we&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(we&&S.extensions.multiDraw===!0||ye)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot}function p(S){let b=[];if(S.shaderID?b.push(S.shaderID):(b.push(S.customVertexShaderID),b.push(S.customFragmentShaderID)),S.defines!==void 0)for(let R in S.defines)b.push(R),b.push(S.defines[R]);return S.isRawShaderMaterial===!1&&(M(b,S),x(b,S),b.push(i.outputColorSpace)),b.push(S.customProgramCacheKey),b.join()}function M(S,b){S.push(b.precision),S.push(b.outputColorSpace),S.push(b.envMapMode),S.push(b.envMapCubeUVHeight),S.push(b.mapUv),S.push(b.alphaMapUv),S.push(b.lightMapUv),S.push(b.aoMapUv),S.push(b.bumpMapUv),S.push(b.normalMapUv),S.push(b.displacementMapUv),S.push(b.emissiveMapUv),S.push(b.metalnessMapUv),S.push(b.roughnessMapUv),S.push(b.anisotropyMapUv),S.push(b.clearcoatMapUv),S.push(b.clearcoatNormalMapUv),S.push(b.clearcoatRoughnessMapUv),S.push(b.iridescenceMapUv),S.push(b.iridescenceThicknessMapUv),S.push(b.sheenColorMapUv),S.push(b.sheenRoughnessMapUv),S.push(b.specularMapUv),S.push(b.specularColorMapUv),S.push(b.specularIntensityMapUv),S.push(b.transmissionMapUv),S.push(b.thicknessMapUv),S.push(b.combine),S.push(b.fogExp2),S.push(b.sizeAttenuation),S.push(b.morphTargetsCount),S.push(b.morphAttributeCount),S.push(b.numDirLights),S.push(b.numPointLights),S.push(b.numSpotLights),S.push(b.numSpotLightMaps),S.push(b.numHemiLights),S.push(b.numRectAreaLights),S.push(b.numDirLightShadows),S.push(b.numPointLightShadows),S.push(b.numSpotLightShadows),S.push(b.numSpotLightShadowsWithMaps),S.push(b.numLightProbes),S.push(b.shadowMapType),S.push(b.toneMapping),S.push(b.numClippingPlanes),S.push(b.numClipIntersection),S.push(b.depthPacking)}function x(S,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),b.gradientMap&&o.enable(22),S.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),S.push(o.mask)}function y(S){let b=g[S.type],R;if(b){let L=mi[b];R=hn.clone(L.uniforms)}else R=S.uniforms;return R}function w(S,b){let R;for(let L=0,F=u.length;L<F;L++){let z=u[L];if(z.cacheKey===b){R=z,++R.usedTimes;break}}return R===void 0&&(R=new fv(i,b,S,r),u.push(R)),R}function T(S){if(--S.usedTimes===0){let b=u.indexOf(S);u[b]=u[u.length-1],u.pop(),S.destroy()}}function P(S){l.remove(S)}function A(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:y,acquireProgram:w,releaseProgram:T,releaseShaderCache:P,programs:u,dispose:A}}function gv(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function _v(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function im(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function sm(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h,d,f,g,_,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function o(h,d,f,g,_,m){let p=a(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,g,_,m){let p=a(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||_v),n.length>1&&n.sort(d||im),s.length>1&&s.sort(d||im)}function u(){for(let h=e,d=i.length;h<d;h++){let f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function yv(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new sm,i.set(n,[a])):s>=r.length?(a=new sm,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function xv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new De};break;case"SpotLight":t={position:new C,direction:new C,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new De,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new De,groundColor:new De};break;case"RectAreaLight":t={color:new De,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function vv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var bv=0;function Mv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Sv(i){let e=new xv,t=vv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);let s=new C,r=new Ce,a=new Ce;function o(c){let u=0,h=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,M=0,x=0,y=0,w=0,T=0,P=0;c.sort(Mv);for(let S=0,b=c.length;S<b;S++){let R=c[S],L=R.color,F=R.intensity,z=R.distance,V=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)u+=L.r*F,h+=L.g*F,d+=L.b*F;else if(R.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(R.sh.coefficients[B],F);P++}else if(R.isDirectionalLight){let B=e.get(R);if(B.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let ne=R.shadow,G=t.get(R);G.shadowIntensity=ne.intensity,G.shadowBias=ne.bias,G.shadowNormalBias=ne.normalBias,G.shadowRadius=ne.radius,G.shadowMapSize=ne.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=V,n.directionalShadowMatrix[f]=R.shadow.matrix,M++}n.directional[f]=B,f++}else if(R.isSpotLight){let B=e.get(R);B.position.setFromMatrixPosition(R.matrixWorld),B.color.copy(L).multiplyScalar(F),B.distance=z,B.coneCos=Math.cos(R.angle),B.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),B.decay=R.decay,n.spot[_]=B;let ne=R.shadow;if(R.map&&(n.spotLightMap[w]=R.map,w++,ne.updateMatrices(R),R.castShadow&&T++),n.spotLightMatrix[_]=ne.matrix,R.castShadow){let G=t.get(R);G.shadowIntensity=ne.intensity,G.shadowBias=ne.bias,G.shadowNormalBias=ne.normalBias,G.shadowRadius=ne.radius,G.shadowMapSize=ne.mapSize,n.spotShadow[_]=G,n.spotShadowMap[_]=V,y++}_++}else if(R.isRectAreaLight){let B=e.get(R);B.color.copy(L).multiplyScalar(F),B.halfWidth.set(R.width*.5,0,0),B.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=B,m++}else if(R.isPointLight){let B=e.get(R);if(B.color.copy(R.color).multiplyScalar(R.intensity),B.distance=R.distance,B.decay=R.decay,R.castShadow){let ne=R.shadow,G=t.get(R);G.shadowIntensity=ne.intensity,G.shadowBias=ne.bias,G.shadowNormalBias=ne.normalBias,G.shadowRadius=ne.radius,G.shadowMapSize=ne.mapSize,G.shadowCameraNear=ne.camera.near,G.shadowCameraFar=ne.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=R.shadow.matrix,x++}n.point[g]=B,g++}else if(R.isHemisphereLight){let B=e.get(R);B.skyColor.copy(R.color).multiplyScalar(F),B.groundColor.copy(R.groundColor).multiplyScalar(F),n.hemi[p]=B,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=be.LTC_FLOAT_1,n.rectAreaLTC2=be.LTC_FLOAT_2):(n.rectAreaLTC1=be.LTC_HALF_1,n.rectAreaLTC2=be.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;let A=n.hash;(A.directionalLength!==f||A.pointLength!==g||A.spotLength!==_||A.rectAreaLength!==m||A.hemiLength!==p||A.numDirectionalShadows!==M||A.numPointShadows!==x||A.numSpotShadows!==y||A.numSpotMaps!==w||A.numLightProbes!==P)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=y+w-T,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=P,A.directionalLength=f,A.pointLength=g,A.spotLength=_,A.rectAreaLength=m,A.hemiLength=p,A.numDirectionalShadows=M,A.numPointShadows=x,A.numSpotShadows=y,A.numSpotMaps=w,A.numLightProbes=P,n.version=bv++)}function l(c,u){let h=0,d=0,f=0,g=0,_=0,m=u.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){let x=c[p];if(x.isDirectionalLight){let y=n.directional[h];y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(x.isSpotLight){let y=n.spot[f];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(x.isRectAreaLight){let y=n.rectArea[g];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(x.isPointLight){let y=n.point[d];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),d++}else if(x.isHemisphereLight){let y=n.hemi[_];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function rm(i){let e=new Sv(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function wv(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new rm(i),e.set(s,[o])):r>=a.length?(o=new rm(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Ev=`void main() {
  gl_Position = vec4( position, 1.0 );
}`,Tv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
  const float samples = float( VSM_SAMPLES );
  float mean = 0.0;
  float squared_mean = 0.0;
  float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
  float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
  for ( float i = 0.0; i < samples; i ++ ) {
    float uvOffset = uvStart + i * uvStride;
    #ifdef HORIZONTAL_PASS
      vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
      mean += distribution.x;
      squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
    #else
      float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
      mean += depth;
      squared_mean += depth * depth;
    #endif
  }
  mean = mean / samples;
  squared_mean = squared_mean / samples;
  float std_dev = sqrt( squared_mean - mean * mean );
  gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Av(i,e,t){let n=new ts,s=new he,r=new he,a=new nt,o=new yl({depthPacking:xp}),l=new xl,c={},u=t.maxTextureSize,h={[Qn]:Qt,[Qt]:Qn,[Mn]:Mn},d=new St({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:Ev,fragmentShader:Tv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new gt;g.setAttribute("position",new ct(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new it(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xa;let p=this.type;this.render=function(T,P,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let S=i.getRenderTarget(),b=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Ot),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let F=p!==pi&&this.type===pi,z=p===pi&&this.type!==pi;for(let V=0,B=T.length;V<B;V++){let ne=T[V],G=ne.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let le=G.getFrameExtents();if(s.multiply(le),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/le.x),s.x=r.x*le.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/le.y),s.y=r.y*le.y,G.mapSize.y=r.y)),G.map===null||F===!0||z===!0){let Me=this.type!==pi?{minFilter:Ft,magFilter:Ft}:{};G.map!==null&&G.map.dispose(),G.map=new Vt(s.x,s.y,Me),G.map.texture.name=ne.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let ce=G.getViewportCount();for(let Me=0;Me<ce;Me++){let Re=G.getViewport(Me);a.set(r.x*Re.x,r.y*Re.y,r.x*Re.z,r.y*Re.w),L.viewport(a),G.updateMatrices(ne,Me),n=G.getFrustum(),y(P,A,G.camera,ne,this.type)}G.isPointLightShadow!==!0&&this.type===pi&&M(G,A),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(S,b,R)};function M(T,P){let A=e.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Vt(s.x,s.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(P,null,A,d,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(P,null,A,f,_,null)}function x(T,P,A,S){let b=null,R=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(R!==void 0)b=R;else if(b=A.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let L=b.uuid,F=P.uuid,z=c[L];z===void 0&&(z={},c[L]=z);let V=z[F];V===void 0&&(V=b.clone(),z[F]=V,P.addEventListener("dispose",w)),b=V}if(b.visible=P.visible,b.wireframe=P.wireframe,S===pi?b.side=P.shadowSide!==null?P.shadowSide:P.side:b.side=P.shadowSide!==null?P.shadowSide:h[P.side],b.alphaMap=P.alphaMap,b.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,b.map=P.map,b.clipShadows=P.clipShadows,b.clippingPlanes=P.clippingPlanes,b.clipIntersection=P.clipIntersection,b.displacementMap=P.displacementMap,b.displacementScale=P.displacementScale,b.displacementBias=P.displacementBias,b.wireframeLinewidth=P.wireframeLinewidth,b.linewidth=P.linewidth,A.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let L=i.properties.get(b);L.light=A}return b}function y(T,P,A,S,b){if(T.visible===!1)return;if(T.layers.test(P.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&b===pi)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let F=e.update(T),z=T.material;if(Array.isArray(z)){let V=F.groups;for(let B=0,ne=V.length;B<ne;B++){let G=V[B],le=z[G.materialIndex];if(le&&le.visible){let ce=x(T,le,S,b);T.onBeforeShadow(i,T,P,A,F,ce,G),i.renderBufferDirect(A,null,F,ce,T,G),T.onAfterShadow(i,T,P,A,F,ce,G)}}}else if(z.visible){let V=x(T,z,S,b);T.onBeforeShadow(i,T,P,A,F,V,null),i.renderBufferDirect(A,null,F,V,T,null),T.onAfterShadow(i,T,P,A,F,V,null)}}let L=T.children;for(let F=0,z=L.length;F<z;F++)y(L[F],P,A,S,b)}function w(T){T.target.removeEventListener("dispose",w);for(let A in c){let S=c[A],b=T.target.uuid;b in S&&(S[b].dispose(),delete S[b])}}}var Rv={[Rl]:Cl,[Pl]:Ll,[Il]:Ul,[ws]:Dl,[Cl]:Rl,[Ll]:Pl,[Ul]:Il,[Dl]:ws};function Cv(i,e){function t(){let I=!1,j=new nt,ie=null,se=new nt(0,0,0,0);return{setMask:function(ae){ie!==ae&&!I&&(i.colorMask(ae,ae,ae,ae),ie=ae)},setLocked:function(ae){I=ae},setClear:function(ae,te,we,Ne,ot){ot===!0&&(ae*=Ne,te*=Ne,we*=Ne),j.set(ae,te,we,Ne),se.equals(j)===!1&&(i.clearColor(ae,te,we,Ne),se.copy(j))},reset:function(){I=!1,ie=null,se.set(-1,0,0,0)}}}function n(){let I=!1,j=!1,ie=null,se=null,ae=null;return{setReversed:function(te){if(j!==te){let we=e.get("EXT_clip_control");te?we.clipControlEXT(we.LOWER_LEFT_EXT,we.ZERO_TO_ONE_EXT):we.clipControlEXT(we.LOWER_LEFT_EXT,we.NEGATIVE_ONE_TO_ONE_EXT),j=te;let Ne=ae;ae=null,this.setClear(Ne)}},getReversed:function(){return j},setTest:function(te){te?Z(i.DEPTH_TEST):me(i.DEPTH_TEST)},setMask:function(te){ie!==te&&!I&&(i.depthMask(te),ie=te)},setFunc:function(te){if(j&&(te=Rv[te]),se!==te){switch(te){case Rl:i.depthFunc(i.NEVER);break;case Cl:i.depthFunc(i.ALWAYS);break;case Pl:i.depthFunc(i.LESS);break;case ws:i.depthFunc(i.LEQUAL);break;case Il:i.depthFunc(i.EQUAL);break;case Dl:i.depthFunc(i.GEQUAL);break;case Ll:i.depthFunc(i.GREATER);break;case Ul:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}se=te}},setLocked:function(te){I=te},setClear:function(te){ae!==te&&(j&&(te=1-te),i.clearDepth(te),ae=te)},reset:function(){I=!1,ie=null,se=null,ae=null,j=!1}}}function s(){let I=!1,j=null,ie=null,se=null,ae=null,te=null,we=null,Ne=null,ot=null;return{setTest:function(rt){I||(rt?Z(i.STENCIL_TEST):me(i.STENCIL_TEST))},setMask:function(rt){j!==rt&&!I&&(i.stencilMask(rt),j=rt)},setFunc:function(rt,Pt,fn){(ie!==rt||se!==Pt||ae!==fn)&&(i.stencilFunc(rt,Pt,fn),ie=rt,se=Pt,ae=fn)},setOp:function(rt,Pt,fn){(te!==rt||we!==Pt||Ne!==fn)&&(i.stencilOp(rt,Pt,fn),te=rt,we=Pt,Ne=fn)},setLocked:function(rt){I=rt},setClear:function(rt){ot!==rt&&(i.clearStencil(rt),ot=rt)},reset:function(){I=!1,j=null,ie=null,se=null,ae=null,te=null,we=null,Ne=null,ot=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,x=null,y=null,w=null,T=null,P=new De(0,0,0),A=0,S=!1,b=null,R=null,L=null,F=null,z=null,V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),B=!1,ne=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(G)[1]),B=ne>=1):G.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),B=ne>=2);let le=null,ce={},Me=i.getParameter(i.SCISSOR_BOX),Re=i.getParameter(i.VIEWPORT),Fe=new nt().fromArray(Me),Ve=new nt().fromArray(Re);function pe(I,j,ie,se){let ae=new Uint8Array(4),te=i.createTexture();i.bindTexture(I,te),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let we=0;we<ie;we++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,se,0,i.RGBA,i.UNSIGNED_BYTE,ae):i.texImage2D(j+we,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ae);return te}let q={};q[i.TEXTURE_2D]=pe(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=pe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=pe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=pe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Z(i.DEPTH_TEST),a.setFunc(ws),Y(!1),ue(ih),Z(i.CULL_FACE),at(Ot);function Z(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function me(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function Ee(I,j){return h[I]!==j?(i.bindFramebuffer(I,j),h[I]=j,I===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=j),I===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=j),!0):!1}function ye(I,j){let ie=f,se=!1;if(I){ie=d.get(j),ie===void 0&&(ie=[],d.set(j,ie));let ae=I.textures;if(ie.length!==ae.length||ie[0]!==i.COLOR_ATTACHMENT0){for(let te=0,we=ae.length;te<we;te++)ie[te]=i.COLOR_ATTACHMENT0+te;ie.length=ae.length,se=!0}}else ie[0]!==i.BACK&&(ie[0]=i.BACK,se=!0);se&&i.drawBuffers(ie)}function Le(I){return g!==I?(i.useProgram(I),g=I,!0):!1}let dt={[In]:i.FUNC_ADD,[ep]:i.FUNC_SUBTRACT,[tp]:i.FUNC_REVERSE_SUBTRACT};dt[np]=i.MIN,dt[ip]=i.MAX;let U={[zs]:i.ZERO,[sp]:i.ONE,[rp]:i.SRC_COLOR,[il]:i.SRC_ALPHA,[cp]:i.SRC_ALPHA_SATURATE,[$a]:i.DST_COLOR,[Ya]:i.DST_ALPHA,[ap]:i.ONE_MINUS_SRC_COLOR,[sl]:i.ONE_MINUS_SRC_ALPHA,[lp]:i.ONE_MINUS_DST_COLOR,[op]:i.ONE_MINUS_DST_ALPHA,[up]:i.CONSTANT_COLOR,[hp]:i.ONE_MINUS_CONSTANT_COLOR,[dp]:i.CONSTANT_ALPHA,[fp]:i.ONE_MINUS_CONSTANT_ALPHA};function at(I,j,ie,se,ae,te,we,Ne,ot,rt){if(I===Ot){_===!0&&(me(i.BLEND),_=!1);return}if(_===!1&&(Z(i.BLEND),_=!0),I!==Al){if(I!==m||rt!==S){if((p!==In||y!==In)&&(i.blendEquation(i.FUNC_ADD),p=In,y=In),rt)switch(I){case Ss:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case sh:i.blendFunc(i.ONE,i.ONE);break;case rh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ah:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Ss:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case sh:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case rh:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ah:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}M=null,x=null,w=null,T=null,P.set(0,0,0),A=0,m=I,S=rt}return}ae=ae||j,te=te||ie,we=we||se,(j!==p||ae!==y)&&(i.blendEquationSeparate(dt[j],dt[ae]),p=j,y=ae),(ie!==M||se!==x||te!==w||we!==T)&&(i.blendFuncSeparate(U[ie],U[se],U[te],U[we]),M=ie,x=se,w=te,T=we),(Ne.equals(P)===!1||ot!==A)&&(i.blendColor(Ne.r,Ne.g,Ne.b,ot),P.copy(Ne),A=ot),m=I,S=!1}function ze(I,j){I.side===Mn?me(i.CULL_FACE):Z(i.CULL_FACE);let ie=I.side===Qt;j&&(ie=!ie),Y(ie),I.blending===Ss&&I.transparent===!1?at(Ot):at(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);let se=I.stencilWrite;o.setTest(se),se&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),fe(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Z(i.SAMPLE_ALPHA_TO_COVERAGE):me(i.SAMPLE_ALPHA_TO_COVERAGE)}function Y(I){b!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),b=I)}function ue(I){I!==Kf?(Z(i.CULL_FACE),I!==R&&(I===ih?i.cullFace(i.BACK):I===Jf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):me(i.CULL_FACE),R=I}function ke(I){I!==L&&(B&&i.lineWidth(I),L=I)}function fe(I,j,ie){I?(Z(i.POLYGON_OFFSET_FILL),(F!==j||z!==ie)&&(i.polygonOffset(j,ie),F=j,z=ie)):me(i.POLYGON_OFFSET_FILL)}function Ie(I){I?Z(i.SCISSOR_TEST):me(i.SCISSOR_TEST)}function $e(I){I===void 0&&(I=i.TEXTURE0+V-1),le!==I&&(i.activeTexture(I),le=I)}function Ze(I,j,ie){ie===void 0&&(le===null?ie=i.TEXTURE0+V-1:ie=le);let se=ce[ie];se===void 0&&(se={type:void 0,texture:void 0},ce[ie]=se),(se.type!==I||se.texture!==j)&&(le!==ie&&(i.activeTexture(ie),le=ie),i.bindTexture(I,j||q[I]),se.type=I,se.texture=j)}function D(){let I=ce[le];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function v(){try{i.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{i.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ee(){try{i.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function _e(){try{i.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function oe(){try{i.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function xe(){try{i.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ge(){try{i.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function re(){try{i.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ve(I){Fe.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Fe.copy(I))}function Ue(I){Ve.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Ve.copy(I))}function Te(I,j){let ie=c.get(j);ie===void 0&&(ie=new WeakMap,c.set(j,ie));let se=ie.get(I);se===void 0&&(se=i.getUniformBlockIndex(j,I.name),ie.set(I,se))}function N(I,j){let se=c.get(j).get(I);l.get(j)!==se&&(i.uniformBlockBinding(j,se,I.__bindingPointIndex),l.set(j,se))}function X(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},le=null,ce={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,x=null,y=null,w=null,T=null,P=new De(0,0,0),A=0,S=!1,b=null,R=null,L=null,F=null,z=null,Fe.set(0,0,i.canvas.width,i.canvas.height),Ve.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Z,disable:me,bindFramebuffer:Ee,drawBuffers:ye,useProgram:Le,setBlending:at,setMaterial:ze,setFlipSided:Y,setCullFace:ue,setLineWidth:ke,setPolygonOffset:fe,setScissorTest:Ie,activeTexture:$e,bindTexture:Ze,unbindTexture:D,compressedTexImage2D:v,compressedTexImage3D:O,texImage2D:ge,texImage3D:re,updateUBOMapping:Te,uniformBlockBinding:N,texStorage2D:oe,texStorage3D:xe,texSubImage2D:J,texSubImage3D:ee,compressedTexSubImage2D:W,compressedTexSubImage3D:_e,scissor:ve,viewport:Ue,reset:X}}function Pv(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new he,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(D,v){return f?new OffscreenCanvas(D,v):gr("canvas")}function _(D,v,O){let J=1,ee=Ze(D);if((ee.width>O||ee.height>O)&&(J=O/Math.max(ee.width,ee.height)),J<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let W=Math.floor(J*ee.width),_e=Math.floor(J*ee.height);h===void 0&&(h=g(W,_e));let oe=v?g(W,_e):h;return oe.width=W,oe.height=_e,oe.getContext("2d").drawImage(D,0,0,W,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+W+"x"+_e+")."),oe}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),D;return D}function m(D){return D.generateMipmaps}function p(D){i.generateMipmap(D)}function M(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function x(D,v,O,J,ee=!1){if(D!==null){if(i[D]!==void 0)return i[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let W=v;if(v===i.RED&&(O===i.FLOAT&&(W=i.R32F),O===i.HALF_FLOAT&&(W=i.R16F),O===i.UNSIGNED_BYTE&&(W=i.R8)),v===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(W=i.R8UI),O===i.UNSIGNED_SHORT&&(W=i.R16UI),O===i.UNSIGNED_INT&&(W=i.R32UI),O===i.BYTE&&(W=i.R8I),O===i.SHORT&&(W=i.R16I),O===i.INT&&(W=i.R32I)),v===i.RG&&(O===i.FLOAT&&(W=i.RG32F),O===i.HALF_FLOAT&&(W=i.RG16F),O===i.UNSIGNED_BYTE&&(W=i.RG8)),v===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(W=i.RG8UI),O===i.UNSIGNED_SHORT&&(W=i.RG16UI),O===i.UNSIGNED_INT&&(W=i.RG32UI),O===i.BYTE&&(W=i.RG8I),O===i.SHORT&&(W=i.RG16I),O===i.INT&&(W=i.RG32I)),v===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(W=i.RGB8UI),O===i.UNSIGNED_SHORT&&(W=i.RGB16UI),O===i.UNSIGNED_INT&&(W=i.RGB32UI),O===i.BYTE&&(W=i.RGB8I),O===i.SHORT&&(W=i.RGB16I),O===i.INT&&(W=i.RGB32I)),v===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),O===i.UNSIGNED_INT&&(W=i.RGBA32UI),O===i.BYTE&&(W=i.RGBA8I),O===i.SHORT&&(W=i.RGBA16I),O===i.INT&&(W=i.RGBA32I)),v===i.RGB&&(O===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),O===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),v===i.RGBA){let _e=ee?ha:Je.getTransfer(J);O===i.FLOAT&&(W=i.RGBA32F),O===i.HALF_FLOAT&&(W=i.RGBA16F),O===i.UNSIGNED_BYTE&&(W=_e===ht?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function y(D,v){let O;return D?v===null||v===ns||v===is?O=i.DEPTH24_STENCIL8:v===cn?O=i.DEPTH32F_STENCIL8:v===Nr&&(O=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===ns||v===is?O=i.DEPTH_COMPONENT24:v===cn?O=i.DEPTH_COMPONENT32F:v===Nr&&(O=i.DEPTH_COMPONENT16),O}function w(D,v){return m(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ft&&D.minFilter!==Lt?Math.log2(Math.max(v.width,v.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?v.mipmaps.length:1}function T(D){let v=D.target;v.removeEventListener("dispose",T),A(v),v.isVideoTexture&&u.delete(v)}function P(D){let v=D.target;v.removeEventListener("dispose",P),b(v)}function A(D){let v=n.get(D);if(v.__webglInit===void 0)return;let O=D.source,J=d.get(O);if(J){let ee=J[v.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&S(D),Object.keys(J).length===0&&d.delete(O)}n.remove(D)}function S(D){let v=n.get(D);i.deleteTexture(v.__webglTexture);let O=D.source,J=d.get(O);delete J[v.__cacheKey],a.memory.textures--}function b(D){let v=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(v.__webglFramebuffer[J]))for(let ee=0;ee<v.__webglFramebuffer[J].length;ee++)i.deleteFramebuffer(v.__webglFramebuffer[J][ee]);else i.deleteFramebuffer(v.__webglFramebuffer[J]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[J])}else{if(Array.isArray(v.__webglFramebuffer))for(let J=0;J<v.__webglFramebuffer.length;J++)i.deleteFramebuffer(v.__webglFramebuffer[J]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let J=0;J<v.__webglColorRenderbuffer.length;J++)v.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[J]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let O=D.textures;for(let J=0,ee=O.length;J<ee;J++){let W=n.get(O[J]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(O[J])}n.remove(D)}let R=0;function L(){R=0}function F(){let D=R;return D>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+s.maxTextures),R+=1,D}function z(D){let v=[];return v.push(D.wrapS),v.push(D.wrapT),v.push(D.wrapR||0),v.push(D.magFilter),v.push(D.minFilter),v.push(D.anisotropy),v.push(D.internalFormat),v.push(D.format),v.push(D.type),v.push(D.generateMipmaps),v.push(D.premultiplyAlpha),v.push(D.flipY),v.push(D.unpackAlignment),v.push(D.colorSpace),v.join()}function V(D,v){let O=n.get(D);if(D.isVideoTexture&&Ie(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&O.__version!==D.version){let J=D.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(O,D,v);return}}else D.isExternalTexture&&(O.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+v)}function B(D,v){let O=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&O.__version!==D.version){q(O,D,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+v)}function ne(D,v){let O=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&O.__version!==D.version){q(O,D,v);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+v)}function G(D,v){let O=n.get(D);if(D.version>0&&O.__version!==D.version){Z(O,D,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+v)}let le={[kt]:i.REPEAT,[Vn]:i.CLAMP_TO_EDGE,[pr]:i.MIRRORED_REPEAT},ce={[Ft]:i.NEAREST,[Vl]:i.NEAREST_MIPMAP_NEAREST,[Hs]:i.NEAREST_MIPMAP_LINEAR,[Lt]:i.LINEAR,[Ur]:i.LINEAR_MIPMAP_NEAREST,[Sn]:i.LINEAR_MIPMAP_LINEAR},Me={[bp]:i.NEVER,[Ap]:i.ALWAYS,[Mp]:i.LESS,[_h]:i.LEQUAL,[Sp]:i.EQUAL,[Tp]:i.GEQUAL,[wp]:i.GREATER,[Ep]:i.NOTEQUAL};function Re(D,v){if(v.type===cn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Lt||v.magFilter===Ur||v.magFilter===Hs||v.magFilter===Sn||v.minFilter===Lt||v.minFilter===Ur||v.minFilter===Hs||v.minFilter===Sn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,le[v.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,le[v.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,le[v.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,ce[v.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,ce[v.minFilter]),v.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,Me[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Ft||v.minFilter!==Hs&&v.minFilter!==Sn||v.type===cn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function Fe(D,v){let O=!1;D.__webglInit===void 0&&(D.__webglInit=!0,v.addEventListener("dispose",T));let J=v.source,ee=d.get(J);ee===void 0&&(ee={},d.set(J,ee));let W=z(v);if(W!==D.__cacheKey){ee[W]===void 0&&(ee[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,O=!0),ee[W].usedTimes++;let _e=ee[D.__cacheKey];_e!==void 0&&(ee[D.__cacheKey].usedTimes--,_e.usedTimes===0&&S(v)),D.__cacheKey=W,D.__webglTexture=ee[W].texture}return O}function Ve(D,v,O){return Math.floor(Math.floor(D/O)/v)}function pe(D,v,O,J){let W=D.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,O,J,v.data);else{W.sort((re,ve)=>re.start-ve.start);let _e=0;for(let re=1;re<W.length;re++){let ve=W[_e],Ue=W[re],Te=ve.start+ve.count,N=Ve(Ue.start,v.width,4),X=Ve(ve.start,v.width,4);Ue.start<=Te+1&&N===X&&Ve(Ue.start+Ue.count-1,v.width,4)===N?ve.count=Math.max(ve.count,Ue.start+Ue.count-ve.start):(++_e,W[_e]=Ue)}W.length=_e+1;let oe=i.getParameter(i.UNPACK_ROW_LENGTH),xe=i.getParameter(i.UNPACK_SKIP_PIXELS),ge=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let re=0,ve=W.length;re<ve;re++){let Ue=W[re],Te=Math.floor(Ue.start/4),N=Math.ceil(Ue.count/4),X=Te%v.width,I=Math.floor(Te/v.width),j=N,ie=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,X),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,X,I,j,ie,O,J,v.data)}D.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,oe),i.pixelStorei(i.UNPACK_SKIP_PIXELS,xe),i.pixelStorei(i.UNPACK_SKIP_ROWS,ge)}}function q(D,v,O){let J=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(J=i.TEXTURE_3D);let ee=Fe(D,v),W=v.source;t.bindTexture(J,D.__webglTexture,i.TEXTURE0+O);let _e=n.get(W);if(W.version!==_e.__version||ee===!0){t.activeTexture(i.TEXTURE0+O);let oe=Je.getPrimaries(Je.workingColorSpace),xe=v.colorSpace===Fn?null:Je.getPrimaries(v.colorSpace),ge=v.colorSpace===Fn||oe===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge);let re=_(v.image,!1,s.maxTextureSize);re=$e(v,re);let ve=r.convert(v.format,v.colorSpace),Ue=r.convert(v.type),Te=x(v.internalFormat,ve,Ue,v.colorSpace,v.isVideoTexture);Re(J,v);let N,X=v.mipmaps,I=v.isVideoTexture!==!0,j=_e.__version===void 0||ee===!0,ie=W.dataReady,se=w(v,re);if(v.isDepthTexture)Te=y(v.format===ss,v.type),j&&(I?t.texStorage2D(i.TEXTURE_2D,1,Te,re.width,re.height):t.texImage2D(i.TEXTURE_2D,0,Te,re.width,re.height,0,ve,Ue,null));else if(v.isDataTexture)if(X.length>0){I&&j&&t.texStorage2D(i.TEXTURE_2D,se,Te,X[0].width,X[0].height);for(let ae=0,te=X.length;ae<te;ae++)N=X[ae],I?ie&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,N.width,N.height,ve,Ue,N.data):t.texImage2D(i.TEXTURE_2D,ae,Te,N.width,N.height,0,ve,Ue,N.data);v.generateMipmaps=!1}else I?(j&&t.texStorage2D(i.TEXTURE_2D,se,Te,re.width,re.height),ie&&pe(v,re,ve,Ue)):t.texImage2D(i.TEXTURE_2D,0,Te,re.width,re.height,0,ve,Ue,re.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){I&&j&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Te,X[0].width,X[0].height,re.depth);for(let ae=0,te=X.length;ae<te;ae++)if(N=X[ae],v.format!==_n)if(ve!==null)if(I){if(ie)if(v.layerUpdates.size>0){let we=Th(N.width,N.height,v.format,v.type);for(let Ne of v.layerUpdates){let ot=N.data.subarray(Ne*we/N.data.BYTES_PER_ELEMENT,(Ne+1)*we/N.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,Ne,N.width,N.height,1,ve,ot)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,N.width,N.height,re.depth,ve,N.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,Te,N.width,N.height,re.depth,0,N.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?ie&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,N.width,N.height,re.depth,ve,Ue,N.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,Te,N.width,N.height,re.depth,0,ve,Ue,N.data)}else{I&&j&&t.texStorage2D(i.TEXTURE_2D,se,Te,X[0].width,X[0].height);for(let ae=0,te=X.length;ae<te;ae++)N=X[ae],v.format!==_n?ve!==null?I?ie&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,N.width,N.height,ve,N.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,Te,N.width,N.height,0,N.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?ie&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,N.width,N.height,ve,Ue,N.data):t.texImage2D(i.TEXTURE_2D,ae,Te,N.width,N.height,0,ve,Ue,N.data)}else if(v.isDataArrayTexture)if(I){if(j&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Te,re.width,re.height,re.depth),ie)if(v.layerUpdates.size>0){let ae=Th(re.width,re.height,v.format,v.type);for(let te of v.layerUpdates){let we=re.data.subarray(te*ae/re.data.BYTES_PER_ELEMENT,(te+1)*ae/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,te,re.width,re.height,1,ve,Ue,we)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ve,Ue,re.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Te,re.width,re.height,re.depth,0,ve,Ue,re.data);else if(v.isData3DTexture)I?(j&&t.texStorage3D(i.TEXTURE_3D,se,Te,re.width,re.height,re.depth),ie&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ve,Ue,re.data)):t.texImage3D(i.TEXTURE_3D,0,Te,re.width,re.height,re.depth,0,ve,Ue,re.data);else if(v.isFramebufferTexture){if(j)if(I)t.texStorage2D(i.TEXTURE_2D,se,Te,re.width,re.height);else{let ae=re.width,te=re.height;for(let we=0;we<se;we++)t.texImage2D(i.TEXTURE_2D,we,Te,ae,te,0,ve,Ue,null),ae>>=1,te>>=1}}else if(X.length>0){if(I&&j){let ae=Ze(X[0]);t.texStorage2D(i.TEXTURE_2D,se,Te,ae.width,ae.height)}for(let ae=0,te=X.length;ae<te;ae++)N=X[ae],I?ie&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,ve,Ue,N):t.texImage2D(i.TEXTURE_2D,ae,Te,ve,Ue,N);v.generateMipmaps=!1}else if(I){if(j){let ae=Ze(re);t.texStorage2D(i.TEXTURE_2D,se,Te,ae.width,ae.height)}ie&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ve,Ue,re)}else t.texImage2D(i.TEXTURE_2D,0,Te,ve,Ue,re);m(v)&&p(J),_e.__version=W.version,v.onUpdate&&v.onUpdate(v)}D.__version=v.version}function Z(D,v,O){if(v.image.length!==6)return;let J=Fe(D,v),ee=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+O);let W=n.get(ee);if(ee.version!==W.__version||J===!0){t.activeTexture(i.TEXTURE0+O);let _e=Je.getPrimaries(Je.workingColorSpace),oe=v.colorSpace===Fn?null:Je.getPrimaries(v.colorSpace),xe=v.colorSpace===Fn||_e===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let ge=v.isCompressedTexture||v.image[0].isCompressedTexture,re=v.image[0]&&v.image[0].isDataTexture,ve=[];for(let te=0;te<6;te++)!ge&&!re?ve[te]=_(v.image[te],!0,s.maxCubemapSize):ve[te]=re?v.image[te].image:v.image[te],ve[te]=$e(v,ve[te]);let Ue=ve[0],Te=r.convert(v.format,v.colorSpace),N=r.convert(v.type),X=x(v.internalFormat,Te,N,v.colorSpace),I=v.isVideoTexture!==!0,j=W.__version===void 0||J===!0,ie=ee.dataReady,se=w(v,Ue);Re(i.TEXTURE_CUBE_MAP,v);let ae;if(ge){I&&j&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,X,Ue.width,Ue.height);for(let te=0;te<6;te++){ae=ve[te].mipmaps;for(let we=0;we<ae.length;we++){let Ne=ae[we];v.format!==_n?Te!==null?I?ie&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we,0,0,Ne.width,Ne.height,Te,Ne.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we,X,Ne.width,Ne.height,0,Ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we,0,0,Ne.width,Ne.height,Te,N,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we,X,Ne.width,Ne.height,0,Te,N,Ne.data)}}}else{if(ae=v.mipmaps,I&&j){ae.length>0&&se++;let te=Ze(ve[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,X,te.width,te.height)}for(let te=0;te<6;te++)if(re){I?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,ve[te].width,ve[te].height,Te,N,ve[te].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,X,ve[te].width,ve[te].height,0,Te,N,ve[te].data);for(let we=0;we<ae.length;we++){let ot=ae[we].image[te].image;I?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we+1,0,0,ot.width,ot.height,Te,N,ot.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we+1,X,ot.width,ot.height,0,Te,N,ot.data)}}else{I?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Te,N,ve[te]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,X,Te,N,ve[te]);for(let we=0;we<ae.length;we++){let Ne=ae[we];I?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we+1,0,0,Te,N,Ne.image[te]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+te,we+1,X,Te,N,Ne.image[te])}}}m(v)&&p(i.TEXTURE_CUBE_MAP),W.__version=ee.version,v.onUpdate&&v.onUpdate(v)}D.__version=v.version}function me(D,v,O,J,ee,W){let _e=r.convert(O.format,O.colorSpace),oe=r.convert(O.type),xe=x(O.internalFormat,_e,oe,O.colorSpace),ge=n.get(v),re=n.get(O);if(re.__renderTarget=v,!ge.__hasExternalTextures){let ve=Math.max(1,v.width>>W),Ue=Math.max(1,v.height>>W);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,W,xe,ve,Ue,v.depth,0,_e,oe,null):t.texImage2D(ee,W,xe,ve,Ue,0,_e,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),fe(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,ee,re.__webglTexture,0,ke(v)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,ee,re.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ee(D,v,O){if(i.bindRenderbuffer(i.RENDERBUFFER,D),v.depthBuffer){let J=v.depthTexture,ee=J&&J.isDepthTexture?J.type:null,W=y(v.stencilBuffer,ee),_e=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=ke(v);fe(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,oe,W,v.width,v.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,oe,W,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,W,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,_e,i.RENDERBUFFER,D)}else{let J=v.textures;for(let ee=0;ee<J.length;ee++){let W=J[ee],_e=r.convert(W.format,W.colorSpace),oe=r.convert(W.type),xe=x(W.internalFormat,_e,oe,W.colorSpace),ge=ke(v);O&&fe(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ge,xe,v.width,v.height):fe(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ge,xe,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,xe,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ye(D,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=n.get(v.depthTexture);J.__renderTarget=v,(!J.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),V(v.depthTexture,0);let ee=J.__webglTexture,W=ke(v);if(v.depthTexture.format===mr)fe(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ee,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ee,0);else if(v.depthTexture.format===ss)fe(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ee,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function Le(D){let v=n.get(D),O=D.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==D.depthTexture){let J=D.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),J){let ee=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,J.removeEventListener("dispose",ee)};J.addEventListener("dispose",ee),v.__depthDisposeCallback=ee}v.__boundDepthTexture=J}if(D.depthTexture&&!v.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let J=D.texture.mipmaps;J&&J.length>0?ye(v.__webglFramebuffer[0],D):ye(v.__webglFramebuffer,D)}else if(O){v.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[J]),v.__webglDepthbuffer[J]===void 0)v.__webglDepthbuffer[J]=i.createRenderbuffer(),Ee(v.__webglDepthbuffer[J],D,!1);else{let ee=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,W)}}else{let J=D.texture.mipmaps;if(J&&J.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),Ee(v.__webglDepthbuffer,D,!1);else{let ee=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function dt(D,v,O){let J=n.get(D);v!==void 0&&me(J.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Le(D)}function U(D){let v=D.texture,O=n.get(D),J=n.get(v);D.addEventListener("dispose",P);let ee=D.textures,W=D.isWebGLCubeRenderTarget===!0,_e=ee.length>1;if(_e||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=v.version,a.memory.textures++),W){O.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer[oe]=[];for(let xe=0;xe<v.mipmaps.length;xe++)O.__webglFramebuffer[oe][xe]=i.createFramebuffer()}else O.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer=[];for(let oe=0;oe<v.mipmaps.length;oe++)O.__webglFramebuffer[oe]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(_e)for(let oe=0,xe=ee.length;oe<xe;oe++){let ge=n.get(ee[oe]);ge.__webglTexture===void 0&&(ge.__webglTexture=i.createTexture(),a.memory.textures++)}if(D.samples>0&&fe(D)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let oe=0;oe<ee.length;oe++){let xe=ee[oe];O.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[oe]);let ge=r.convert(xe.format,xe.colorSpace),re=r.convert(xe.type),ve=x(xe.internalFormat,ge,re,xe.colorSpace,D.isXRRenderTarget===!0),Ue=ke(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue,ve,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,O.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),Ee(O.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Re(i.TEXTURE_CUBE_MAP,v);for(let oe=0;oe<6;oe++)if(v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)me(O.__webglFramebuffer[oe][xe],D,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,xe);else me(O.__webglFramebuffer[oe],D,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(v)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(_e){for(let oe=0,xe=ee.length;oe<xe;oe++){let ge=ee[oe],re=n.get(ge),ve=i.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ve=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ve,re.__webglTexture),Re(ve,ge),me(O.__webglFramebuffer,D,ge,i.COLOR_ATTACHMENT0+oe,ve,0),m(ge)&&p(ve)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(oe=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(oe,J.__webglTexture),Re(oe,v),v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)me(O.__webglFramebuffer[xe],D,v,i.COLOR_ATTACHMENT0,oe,xe);else me(O.__webglFramebuffer,D,v,i.COLOR_ATTACHMENT0,oe,0);m(v)&&p(oe),t.unbindTexture()}D.depthBuffer&&Le(D)}function at(D){let v=D.textures;for(let O=0,J=v.length;O<J;O++){let ee=v[O];if(m(ee)){let W=M(D),_e=n.get(ee).__webglTexture;t.bindTexture(W,_e),p(W),t.unbindTexture()}}}let ze=[],Y=[];function ue(D){if(D.samples>0){if(fe(D)===!1){let v=D.textures,O=D.width,J=D.height,ee=i.COLOR_BUFFER_BIT,W=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=n.get(D),oe=v.length>1;if(oe)for(let ge=0;ge<v.length;ge++)t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer);let xe=D.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let ge=0;ge<v.length;ge++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),oe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,_e.__webglColorRenderbuffer[ge]);let re=n.get(v[ge]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,re,0)}i.blitFramebuffer(0,0,O,J,0,0,O,J,ee,i.NEAREST),l===!0&&(ze.length=0,Y.length=0,ze.push(i.COLOR_ATTACHMENT0+ge),D.depthBuffer&&D.resolveDepthBuffer===!1&&(ze.push(W),Y.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Y)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ze))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let ge=0;ge<v.length;ge++){t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.RENDERBUFFER,_e.__webglColorRenderbuffer[ge]);let re=n.get(v[ge]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.TEXTURE_2D,re,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&l){let v=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function ke(D){return Math.min(s.maxSamples,D.samples)}function fe(D){let v=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Ie(D){let v=a.render.frame;u.get(D)!==v&&(u.set(D,v),D.update())}function $e(D,v){let O=D.colorSpace,J=D.format,ee=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||O!==Ht&&O!==Fn&&(Je.getTransfer(O)===ht?(J!==_n||ee!==Nn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),v}function Ze(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=F,this.resetTextureUnits=L,this.setTexture2D=V,this.setTexture2DArray=B,this.setTexture3D=ne,this.setTextureCube=G,this.rebindTextures=dt,this.setupRenderTarget=U,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=ue,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=me,this.useMultisampledRTT=fe}function Iv(i,e){function t(n,s=Fn){let r,a=Je.getTransfer(s);if(n===Nn)return i.UNSIGNED_BYTE;if(n===Wl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===jl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===hh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===dh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ch)return i.BYTE;if(n===uh)return i.SHORT;if(n===Nr)return i.UNSIGNED_SHORT;if(n===Gl)return i.INT;if(n===ns)return i.UNSIGNED_INT;if(n===cn)return i.FLOAT;if(n===Ut)return i.HALF_FLOAT;if(n===fh)return i.ALPHA;if(n===ph)return i.RGB;if(n===_n)return i.RGBA;if(n===mr)return i.DEPTH_COMPONENT;if(n===ss)return i.DEPTH_STENCIL;if(n===ql)return i.RED;if(n===Xl)return i.RED_INTEGER;if(n===mh)return i.RG;if(n===Yl)return i.RG_INTEGER;if(n===$l)return i.RGBA_INTEGER;if(n===Ka||n===Ja||n===Qa||n===eo)if(a===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ka)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ja)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ka)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ja)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Zl||n===Kl||n===Jl||n===Ql)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Zl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Kl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Jl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ql)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ec||n===tc||n===nc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ec||n===tc)return a===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===nc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ic||n===sc||n===rc||n===ac||n===oc||n===lc||n===cc||n===uc||n===hc||n===dc||n===fc||n===pc||n===mc||n===gc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ic)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===sc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===rc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ac)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===oc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===lc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===cc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===uc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===hc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===dc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===fc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===pc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===mc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===gc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===_c||n===yc||n===xc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===_c)return a===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===yc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===xc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===vc||n===bc||n===Mc||n===Sc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===vc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Mc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Sc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Dv=`
void main() {

  gl_Position = vec4( position, 1.0 );

}`,Lv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

  vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

  if ( coord.x >= 1.0 ) {

    gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

  } else {

    gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

  }

}`,Bh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Sa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new St({vertexShader:Dv,fragmentShader:Lv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new it(new Li(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},kh=class extends oi{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,_=typeof XRWebGLBinding<"u",m=new Bh,p={},M=t.getContextAttributes(),x=null,y=null,w=[],T=[],P=new he,A=null,S=new Dt;S.viewport=new nt;let b=new Dt;b.viewport=new nt;let R=[S,b],L=new Tl,F=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Z=w[q];return Z===void 0&&(Z=new Mr,w[q]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(q){let Z=w[q];return Z===void 0&&(Z=new Mr,w[q]=Z),Z.getGripSpace()},this.getHand=function(q){let Z=w[q];return Z===void 0&&(Z=new Mr,w[q]=Z),Z.getHandSpace()};function V(q){let Z=T.indexOf(q.inputSource);if(Z===-1)return;let me=w[Z];me!==void 0&&(me.update(q.inputSource,q.frame,c||a),me.dispatchEvent({type:q.type,data:q.inputSource}))}function B(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",ne);for(let q=0;q<w.length;q++){let Z=T[q];Z!==null&&(T[q]=null,w[q].disconnect(Z))}F=null,z=null,m.reset();for(let q in p)delete p[q];e.setRenderTarget(x),f=null,d=null,h=null,s=null,y=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",B),s.addEventListener("inputsourceschange",ne),M.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(P),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,Ee=null,ye=null;M.depth&&(ye=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=M.stencil?ss:mr,Ee=M.stencil?is:ns);let Le={colorFormat:t.RGBA8,depthFormat:ye,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Le),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Vt(d.textureWidth,d.textureHeight,{format:_n,type:Nn,depthTexture:new Ps(d.textureWidth,d.textureHeight,Ee,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let me={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,me),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Vt(f.framebufferWidth,f.framebufferHeight,{format:_n,type:Nn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),pe.setContext(s),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(q){for(let Z=0;Z<q.removed.length;Z++){let me=q.removed[Z],Ee=T.indexOf(me);Ee>=0&&(T[Ee]=null,w[Ee].disconnect(me))}for(let Z=0;Z<q.added.length;Z++){let me=q.added[Z],Ee=T.indexOf(me);if(Ee===-1){for(let Le=0;Le<w.length;Le++)if(Le>=T.length){T.push(me),Ee=Le;break}else if(T[Le]===null){T[Le]=me,Ee=Le;break}if(Ee===-1)break}let ye=w[Ee];ye&&ye.connect(me)}}let G=new C,le=new C;function ce(q,Z,me){G.setFromMatrixPosition(Z.matrixWorld),le.setFromMatrixPosition(me.matrixWorld);let Ee=G.distanceTo(le),ye=Z.projectionMatrix.elements,Le=me.projectionMatrix.elements,dt=ye[14]/(ye[10]-1),U=ye[14]/(ye[10]+1),at=(ye[9]+1)/ye[5],ze=(ye[9]-1)/ye[5],Y=(ye[8]-1)/ye[0],ue=(Le[8]+1)/Le[0],ke=dt*Y,fe=dt*ue,Ie=Ee/(-Y+ue),$e=Ie*-Y;if(Z.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX($e),q.translateZ(Ie),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ye[10]===-1)q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{let Ze=dt+Ie,D=U+Ie,v=ke-$e,O=fe+(Ee-$e),J=at*U/D*Ze,ee=ze*U/D*Ze;q.projectionMatrix.makePerspective(v,O,J,ee,Ze,D),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Me(q,Z){Z===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Z.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let Z=q.near,me=q.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(me=m.depthFar)),L.near=b.near=S.near=Z,L.far=b.far=S.far=me,(F!==L.near||z!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),F=L.near,z=L.far),L.layers.mask=q.layers.mask|6,S.layers.mask=L.layers.mask&3,b.layers.mask=L.layers.mask&5;let Ee=q.parent,ye=L.cameras;Me(L,Ee);for(let Le=0;Le<ye.length;Le++)Me(ye[Le],Ee);ye.length===2?ce(L,S,b):L.projectionMatrix.copy(S.projectionMatrix),Re(q,L,Ee)};function Re(q,Z,me){me===null?q.matrix.copy(Z.matrixWorld):(q.matrix.copy(me.matrixWorld),q.matrix.invert(),q.matrix.multiply(Z.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=As*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(q){return p[q]};let Fe=null;function Ve(q,Z){if(u=Z.getViewerPose(c||a),g=Z,u!==null){let me=u.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let Ee=!1;me.length!==L.cameras.length&&(L.cameras.length=0,Ee=!0);for(let U=0;U<me.length;U++){let at=me[U],ze=null;if(f!==null)ze=f.getViewport(at);else{let ue=h.getViewSubImage(d,at);ze=ue.viewport,U===0&&(e.setRenderTargetTextures(y,ue.colorTexture,ue.depthStencilTexture),e.setRenderTarget(y))}let Y=R[U];Y===void 0&&(Y=new Dt,Y.layers.enable(U),Y.viewport=new nt,R[U]=Y),Y.matrix.fromArray(at.transform.matrix),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.projectionMatrix.fromArray(at.projectionMatrix),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert(),Y.viewport.set(ze.x,ze.y,ze.width,ze.height),U===0&&(L.matrix.copy(Y.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ee===!0&&L.cameras.push(Y)}let ye=s.enabledFeatures;if(ye&&ye.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){h=n.getBinding();let U=h.getDepthInformation(me[0]);U&&U.isValid&&U.texture&&m.init(U,s.renderState)}if(ye&&ye.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let U=0;U<me.length;U++){let at=me[U].camera;if(at){let ze=p[at];ze||(ze=new Sa,p[at]=ze);let Y=h.getCameraImage(at);ze.sourceTexture=Y}}}}for(let me=0;me<w.length;me++){let Ee=T[me],ye=w[me];Ee!==null&&ye!==void 0&&ye.update(Ee,Z,c||a)}Fe&&Fe(q,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),g=null}let pe=new am;pe.setAnimationLoop(Ve),this.setAnimationLoop=function(q){Fe=q},this.dispose=function(){}}},Ws=new ei,Uv=new Ce;function Nv(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Mh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,M,x,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Qt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Qt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let M=e.get(p),x=M.envMap,y=M.envMapRotation;x&&(m.envMap.value=x,Ws.copy(y),Ws.x*=-1,Ws.y*=-1,Ws.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Ws.y*=-1,Ws.z*=-1),m.envMapRotation.value.setFromMatrix4(Uv.makeRotationFromEuler(Ws)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Fv(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,x){let y=x.program;n.uniformBlockBinding(M,y)}function c(M,x){let y=s[M.id];y===void 0&&(g(M),y=u(M),s[M.id]=y,M.addEventListener("dispose",m));let w=x.program;n.updateUBOMapping(M,w);let T=e.render.frame;r[M.id]!==T&&(d(M),r[M.id]=T)}function u(M){let x=h();M.__bindingPointIndex=x;let y=i.createBuffer(),w=M.__size,T=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,w,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,y),y}function h(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){let x=s[M.id],y=M.uniforms,w=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let T=0,P=y.length;T<P;T++){let A=Array.isArray(y[T])?y[T]:[y[T]];for(let S=0,b=A.length;S<b;S++){let R=A[S];if(f(R,T,S,w)===!0){let L=R.__offset,F=Array.isArray(R.value)?R.value:[R.value],z=0;for(let V=0;V<F.length;V++){let B=F[V],ne=_(B);typeof B=="number"||typeof B=="boolean"?(R.__data[0]=B,i.bufferSubData(i.UNIFORM_BUFFER,L+z,R.__data)):B.isMatrix3?(R.__data[0]=B.elements[0],R.__data[1]=B.elements[1],R.__data[2]=B.elements[2],R.__data[3]=0,R.__data[4]=B.elements[3],R.__data[5]=B.elements[4],R.__data[6]=B.elements[5],R.__data[7]=0,R.__data[8]=B.elements[6],R.__data[9]=B.elements[7],R.__data[10]=B.elements[8],R.__data[11]=0):(B.toArray(R.__data,z),z+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,R.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(M,x,y,w){let T=M.value,P=x+"_"+y;if(w[P]===void 0)return typeof T=="number"||typeof T=="boolean"?w[P]=T:w[P]=T.clone(),!0;{let A=w[P];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return w[P]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function g(M){let x=M.uniforms,y=0,w=16;for(let P=0,A=x.length;P<A;P++){let S=Array.isArray(x[P])?x[P]:[x[P]];for(let b=0,R=S.length;b<R;b++){let L=S[b],F=Array.isArray(L.value)?L.value:[L.value];for(let z=0,V=F.length;z<V;z++){let B=F[z],ne=_(B),G=y%w,le=G%ne.boundary,ce=G+le;y+=le,ce!==0&&w-ce<ne.storage&&(y+=w-ce),L.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=y,y+=ne.storage}}}let T=y%w;return T>0&&(y+=w-T),M.__size=y,M.__cache={},this}function _(M){let x={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(x.boundary=4,x.storage=4):M.isVector2?(x.boundary=8,x.storage=8):M.isVector3||M.isColor?(x.boundary=16,x.storage=12):M.isVector4?(x.boundary=16,x.storage=16):M.isMatrix3?(x.boundary=48,x.storage=48):M.isMatrix4?(x.boundary=64,x.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),x}function m(M){let x=M.target;x.removeEventListener("dispose",m);let y=a.indexOf(x.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Rc=class{constructor(e={}){let{canvas:t=Rp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let g=new Uint32Array(4),_=new Int32Array(4),m=null,p=null,M=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Bi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,w=!1;this._outputColorSpace=Rt;let T=0,P=0,A=null,S=-1,b=null,R=new nt,L=new nt,F=null,z=new De(0),V=0,B=t.width,ne=t.height,G=1,le=null,ce=null,Me=new nt(0,0,B,ne),Re=new nt(0,0,B,ne),Fe=!1,Ve=new ts,pe=!1,q=!1,Z=new Ce,me=new C,Ee=new nt,ye={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Le=!1;function dt(){return A===null?G:1}let U=n;function at(E,k){return t.getContext(E,k)}try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",se,!1),t.addEventListener("webglcontextcreationerror",ae,!1),U===null){let k="webgl2";if(U=at(k,E),U===null)throw at(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let ze,Y,ue,ke,fe,Ie,$e,Ze,D,v,O,J,ee,W,_e,oe,xe,ge,re,ve,Ue,Te,N,X;function I(){ze=new ex(U),ze.init(),Te=new Iv(U,ze),Y=new Xy(U,ze,e,Te),ue=new Cv(U,ze),Y.reversedDepthBuffer&&d&&ue.buffers.depth.setReversed(!0),ke=new ix(U),fe=new gv,Ie=new Pv(U,ze,ue,fe,Y,Te,ke),$e=new $y(y),Ze=new Qy(y),D=new c_(U),N=new jy(U,D),v=new tx(U,D,ke,N),O=new rx(U,v,D,ke),re=new sx(U,Y,Ie),oe=new Yy(fe),J=new mv(y,$e,Ze,ze,Y,N,oe),ee=new Nv(y,fe),W=new yv,_e=new wv(ze),ge=new Wy(y,$e,Ze,ue,O,f,l),xe=new Av(y,O,Y),X=new Fv(U,ke,Y,ue),ve=new qy(U,ze,ke),Ue=new nx(U,ze,ke),ke.programs=J.programs,y.capabilities=Y,y.extensions=ze,y.properties=fe,y.renderLists=W,y.shadowMap=xe,y.state=ue,y.info=ke}I();let j=new kh(y,U);this.xr=j,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let E=ze.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ze.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(B,ne,!1))},this.getSize=function(E){return E.set(B,ne)},this.setSize=function(E,k,$=!0){if(j.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}B=E,ne=k,t.width=Math.floor(E*G),t.height=Math.floor(k*G),$===!0&&(t.style.width=E+"px",t.style.height=k+"px"),this.setViewport(0,0,E,k)},this.getDrawingBufferSize=function(E){return E.set(B*G,ne*G).floor()},this.setDrawingBufferSize=function(E,k,$){B=E,ne=k,G=$,t.width=Math.floor(E*$),t.height=Math.floor(k*$),this.setViewport(0,0,E,k)},this.getCurrentViewport=function(E){return E.copy(R)},this.getViewport=function(E){return E.copy(Me)},this.setViewport=function(E,k,$,K){E.isVector4?Me.set(E.x,E.y,E.z,E.w):Me.set(E,k,$,K),ue.viewport(R.copy(Me).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(Re)},this.setScissor=function(E,k,$,K){E.isVector4?Re.set(E.x,E.y,E.z,E.w):Re.set(E,k,$,K),ue.scissor(L.copy(Re).multiplyScalar(G).round())},this.getScissorTest=function(){return Fe},this.setScissorTest=function(E){ue.setScissorTest(Fe=E)},this.setOpaqueSort=function(E){le=E},this.setTransparentSort=function(E){ce=E},this.getClearColor=function(E){return E.copy(ge.getClearColor())},this.setClearColor=function(){ge.setClearColor(...arguments)},this.getClearAlpha=function(){return ge.getClearAlpha()},this.setClearAlpha=function(){ge.setClearAlpha(...arguments)},this.clear=function(E=!0,k=!0,$=!0){let K=0;if(E){let H=!1;if(A!==null){let de=A.texture.format;H=de===$l||de===Yl||de===Xl}if(H){let de=A.texture.type,Se=de===Nn||de===ns||de===Nr||de===is||de===Wl||de===jl,Pe=ge.getClearColor(),Ae=ge.getClearAlpha(),He=Pe.r,Ge=Pe.g,Oe=Pe.b;Se?(g[0]=He,g[1]=Ge,g[2]=Oe,g[3]=Ae,U.clearBufferuiv(U.COLOR,0,g)):(_[0]=He,_[1]=Ge,_[2]=Oe,_[3]=Ae,U.clearBufferiv(U.COLOR,0,_))}else K|=U.COLOR_BUFFER_BIT}k&&(K|=U.DEPTH_BUFFER_BIT),$&&(K|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",se,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),ge.dispose(),W.dispose(),_e.dispose(),fe.dispose(),$e.dispose(),Ze.dispose(),O.dispose(),N.dispose(),X.dispose(),J.dispose(),j.dispose(),j.removeEventListener("sessionstart",fn),j.removeEventListener("sessionend",Vd),gs.stop()};function ie(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function se(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;let E=ke.autoReset,k=xe.enabled,$=xe.autoUpdate,K=xe.needsUpdate,H=xe.type;I(),ke.autoReset=E,xe.enabled=k,xe.autoUpdate=$,xe.needsUpdate=K,xe.type=H}function ae(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function te(E){let k=E.target;k.removeEventListener("dispose",te),we(k)}function we(E){Ne(E),fe.remove(E)}function Ne(E){let k=fe.get(E).programs;k!==void 0&&(k.forEach(function($){J.releaseProgram($)}),E.isShaderMaterial&&J.releaseShaderCache(E))}this.renderBufferDirect=function(E,k,$,K,H,de){k===null&&(k=ye);let Se=H.isMesh&&H.matrixWorld.determinant()<0,Pe=wg(E,k,$,K,H);ue.setMaterial(K,Se);let Ae=$.index,He=1;if(K.wireframe===!0){if(Ae=v.getWireframeAttribute($),Ae===void 0)return;He=2}let Ge=$.drawRange,Oe=$.attributes.position,tt=Ge.start*He,mt=(Ge.start+Ge.count)*He;de!==null&&(tt=Math.max(tt,de.start*He),mt=Math.min(mt,(de.start+de.count)*He)),Ae!==null?(tt=Math.max(tt,0),mt=Math.min(mt,Ae.count)):Oe!=null&&(tt=Math.max(tt,0),mt=Math.min(mt,Oe.count));let It=mt-tt;if(It<0||It===1/0)return;N.setup(H,K,Pe,$,Ae);let Mt,xt=ve;if(Ae!==null&&(Mt=D.get(Ae),xt=Ue,xt.setIndex(Mt)),H.isMesh)K.wireframe===!0?(ue.setLineWidth(K.wireframeLinewidth*dt()),xt.setMode(U.LINES)):xt.setMode(U.TRIANGLES);else if(H.isLine){let Be=K.linewidth;Be===void 0&&(Be=1),ue.setLineWidth(Be*dt()),H.isLineSegments?xt.setMode(U.LINES):H.isLineLoop?xt.setMode(U.LINE_LOOP):xt.setMode(U.LINE_STRIP)}else H.isPoints?xt.setMode(U.POINTS):H.isSprite&&xt.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(H._multiDrawInstances!==null)_r("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xt.renderMultiDrawInstances(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount,H._multiDrawInstances);else if(ze.get("WEBGL_multi_draw"))xt.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{let Be=H._multiDrawStarts,Tt=H._multiDrawCounts,lt=H._multiDrawCount,An=Ae?D.get(Ae).bytesPerElement:1,Zs=fe.get(K).currentProgram.getUniforms();for(let Rn=0;Rn<lt;Rn++)Zs.setValue(U,"_gl_DrawID",Rn),xt.render(Be[Rn]/An,Tt[Rn])}else if(H.isInstancedMesh)xt.renderInstances(tt,It,H.count);else if($.isInstancedBufferGeometry){let Be=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Tt=Math.min($.instanceCount,Be);xt.renderInstances(tt,It,Tt)}else xt.render(tt,It)};function ot(E,k,$){E.transparent===!0&&E.side===Mn&&E.forceSinglePass===!1?(E.side=Qt,E.needsUpdate=!0,Ao(E,k,$),E.side=Qn,E.needsUpdate=!0,Ao(E,k,$),E.side=Mn):Ao(E,k,$)}this.compile=function(E,k,$=null){$===null&&($=E),p=_e.get($),p.init(k),x.push(p),$.traverseVisible(function(H){H.isLight&&H.layers.test(k.layers)&&(p.pushLight(H),H.castShadow&&p.pushShadow(H))}),E!==$&&E.traverseVisible(function(H){H.isLight&&H.layers.test(k.layers)&&(p.pushLight(H),H.castShadow&&p.pushShadow(H))}),p.setupLights();let K=new Set;return E.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;let de=H.material;if(de)if(Array.isArray(de))for(let Se=0;Se<de.length;Se++){let Pe=de[Se];ot(Pe,$,H),K.add(Pe)}else ot(de,$,H),K.add(de)}),p=x.pop(),K},this.compileAsync=function(E,k,$=null){let K=this.compile(E,k,$);return new Promise(H=>{function de(){if(K.forEach(function(Se){fe.get(Se).currentProgram.isReady()&&K.delete(Se)}),K.size===0){H(E);return}setTimeout(de,10)}ze.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let rt=null;function Pt(E){rt&&rt(E)}function fn(){gs.stop()}function Vd(){gs.start()}let gs=new am;gs.setAnimationLoop(Pt),typeof self<"u"&&gs.setContext(self),this.setAnimationLoop=function(E){rt=E,j.setAnimationLoop(E),E===null?gs.stop():gs.start()},j.addEventListener("sessionstart",fn),j.addEventListener("sessionend",Vd),this.render=function(E,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),j.enabled===!0&&j.isPresenting===!0&&(j.cameraAutoUpdate===!0&&j.updateCamera(k),k=j.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,k,A),p=_e.get(E,x.length),p.init(k),x.push(p),Z.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Ve.setFromProjectionMatrix(Z,Jn,k.reversedDepth),q=this.localClippingEnabled,pe=oe.init(this.clippingPlanes,q),m=W.get(E,M.length),m.init(),M.push(m),j.enabled===!0&&j.isPresenting===!0){let de=y.xr.getDepthSensingMesh();de!==null&&su(de,k,-1/0,y.sortObjects)}su(E,k,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(le,ce),Le=j.enabled===!1||j.isPresenting===!1||j.hasDepthSensing()===!1,Le&&ge.addToRenderList(m,E),this.info.render.frame++,pe===!0&&oe.beginShadows();let $=p.state.shadowsArray;xe.render($,E,k),pe===!0&&oe.endShadows(),this.info.autoReset===!0&&this.info.reset();let K=m.opaque,H=m.transmissive;if(p.setupLights(),k.isArrayCamera){let de=k.cameras;if(H.length>0)for(let Se=0,Pe=de.length;Se<Pe;Se++){let Ae=de[Se];Wd(K,H,E,Ae)}Le&&ge.render(E);for(let Se=0,Pe=de.length;Se<Pe;Se++){let Ae=de[Se];Gd(m,E,Ae,Ae.viewport)}}else H.length>0&&Wd(K,H,E,k),Le&&ge.render(E),Gd(m,E,k);A!==null&&P===0&&(Ie.updateMultisampleRenderTarget(A),Ie.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(y,E,k),N.resetDefaultState(),S=-1,b=null,x.pop(),x.length>0?(p=x[x.length-1],pe===!0&&oe.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function su(E,k,$,K){if(E.visible===!1)return;if(E.layers.test(k.layers)){if(E.isGroup)$=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(k);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Ve.intersectsSprite(E)){K&&Ee.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Z);let Se=O.update(E),Pe=E.material;Pe.visible&&m.push(E,Se,Pe,$,Ee.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Ve.intersectsObject(E))){let Se=O.update(E),Pe=E.material;if(K&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ee.copy(E.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),Ee.copy(Se.boundingSphere.center)),Ee.applyMatrix4(E.matrixWorld).applyMatrix4(Z)),Array.isArray(Pe)){let Ae=Se.groups;for(let He=0,Ge=Ae.length;He<Ge;He++){let Oe=Ae[He],tt=Pe[Oe.materialIndex];tt&&tt.visible&&m.push(E,Se,tt,$,Ee.z,Oe)}}else Pe.visible&&m.push(E,Se,Pe,$,Ee.z,null)}}let de=E.children;for(let Se=0,Pe=de.length;Se<Pe;Se++)su(de[Se],k,$,K)}function Gd(E,k,$,K){let H=E.opaque,de=E.transmissive,Se=E.transparent;p.setupLightsView($),pe===!0&&oe.setGlobalState(y.clippingPlanes,$),K&&ue.viewport(R.copy(K)),H.length>0&&To(H,k,$),de.length>0&&To(de,k,$),Se.length>0&&To(Se,k,$),ue.buffers.depth.setTest(!0),ue.buffers.depth.setMask(!0),ue.buffers.color.setMask(!0),ue.setPolygonOffset(!1)}function Wd(E,k,$,K){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[K.id]===void 0&&(p.state.transmissionRenderTarget[K.id]=new Vt(1,1,{generateMipmaps:!0,type:ze.has("EXT_color_buffer_half_float")||ze.has("EXT_color_buffer_float")?Ut:Nn,minFilter:Sn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Je.workingColorSpace}));let de=p.state.transmissionRenderTarget[K.id],Se=K.viewport||R;de.setSize(Se.z*y.transmissionResolutionScale,Se.w*y.transmissionResolutionScale);let Pe=y.getRenderTarget(),Ae=y.getActiveCubeFace(),He=y.getActiveMipmapLevel();y.setRenderTarget(de),y.getClearColor(z),V=y.getClearAlpha(),V<1&&y.setClearColor(16777215,.5),y.clear(),Le&&ge.render($);let Ge=y.toneMapping;y.toneMapping=Bi;let Oe=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),p.setupLightsView(K),pe===!0&&oe.setGlobalState(y.clippingPlanes,K),To(E,$,K),Ie.updateMultisampleRenderTarget(de),Ie.updateRenderTargetMipmap(de),ze.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let mt=0,It=k.length;mt<It;mt++){let Mt=k[mt],xt=Mt.object,Be=Mt.geometry,Tt=Mt.material,lt=Mt.group;if(Tt.side===Mn&&xt.layers.test(K.layers)){let An=Tt.side;Tt.side=Qt,Tt.needsUpdate=!0,jd(xt,$,K,Be,Tt,lt),Tt.side=An,Tt.needsUpdate=!0,tt=!0}}tt===!0&&(Ie.updateMultisampleRenderTarget(de),Ie.updateRenderTargetMipmap(de))}y.setRenderTarget(Pe,Ae,He),y.setClearColor(z,V),Oe!==void 0&&(K.viewport=Oe),y.toneMapping=Ge}function To(E,k,$){let K=k.isScene===!0?k.overrideMaterial:null;for(let H=0,de=E.length;H<de;H++){let Se=E[H],Pe=Se.object,Ae=Se.geometry,He=Se.group,Ge=Se.material;Ge.allowOverride===!0&&K!==null&&(Ge=K),Pe.layers.test($.layers)&&jd(Pe,k,$,Ae,Ge,He)}}function jd(E,k,$,K,H,de){E.onBeforeRender(y,k,$,K,H,de),E.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),H.onBeforeRender(y,k,$,K,E,de),H.transparent===!0&&H.side===Mn&&H.forceSinglePass===!1?(H.side=Qt,H.needsUpdate=!0,y.renderBufferDirect($,k,K,H,E,de),H.side=Qn,H.needsUpdate=!0,y.renderBufferDirect($,k,K,H,E,de),H.side=Mn):y.renderBufferDirect($,k,K,H,E,de),E.onAfterRender(y,k,$,K,H,de)}function Ao(E,k,$){k.isScene!==!0&&(k=ye);let K=fe.get(E),H=p.state.lights,de=p.state.shadowsArray,Se=H.state.version,Pe=J.getParameters(E,H.state,de,k,$),Ae=J.getProgramCacheKey(Pe),He=K.programs;K.environment=E.isMeshStandardMaterial?k.environment:null,K.fog=k.fog,K.envMap=(E.isMeshStandardMaterial?Ze:$e).get(E.envMap||K.environment),K.envMapRotation=K.environment!==null&&E.envMap===null?k.environmentRotation:E.envMapRotation,He===void 0&&(E.addEventListener("dispose",te),He=new Map,K.programs=He);let Ge=He.get(Ae);if(Ge!==void 0){if(K.currentProgram===Ge&&K.lightsStateVersion===Se)return Xd(E,Pe),Ge}else Pe.uniforms=J.getUniforms(E),E.onBeforeCompile(Pe,y),Ge=J.acquireProgram(Pe,Ae),He.set(Ae,Ge),K.uniforms=Pe.uniforms;let Oe=K.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Oe.clippingPlanes=oe.uniform),Xd(E,Pe),K.needsLights=Tg(E),K.lightsStateVersion=Se,K.needsLights&&(Oe.ambientLightColor.value=H.state.ambient,Oe.lightProbe.value=H.state.probe,Oe.directionalLights.value=H.state.directional,Oe.directionalLightShadows.value=H.state.directionalShadow,Oe.spotLights.value=H.state.spot,Oe.spotLightShadows.value=H.state.spotShadow,Oe.rectAreaLights.value=H.state.rectArea,Oe.ltc_1.value=H.state.rectAreaLTC1,Oe.ltc_2.value=H.state.rectAreaLTC2,Oe.pointLights.value=H.state.point,Oe.pointLightShadows.value=H.state.pointShadow,Oe.hemisphereLights.value=H.state.hemi,Oe.directionalShadowMap.value=H.state.directionalShadowMap,Oe.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Oe.spotShadowMap.value=H.state.spotShadowMap,Oe.spotLightMatrix.value=H.state.spotLightMatrix,Oe.spotLightMap.value=H.state.spotLightMap,Oe.pointShadowMap.value=H.state.pointShadowMap,Oe.pointShadowMatrix.value=H.state.pointShadowMatrix),K.currentProgram=Ge,K.uniformsList=null,Ge}function qd(E){if(E.uniformsList===null){let k=E.currentProgram.getUniforms();E.uniformsList=Br.seqWithValue(k.seq,E.uniforms)}return E.uniformsList}function Xd(E,k){let $=fe.get(E);$.outputColorSpace=k.outputColorSpace,$.batching=k.batching,$.batchingColor=k.batchingColor,$.instancing=k.instancing,$.instancingColor=k.instancingColor,$.instancingMorph=k.instancingMorph,$.skinning=k.skinning,$.morphTargets=k.morphTargets,$.morphNormals=k.morphNormals,$.morphColors=k.morphColors,$.morphTargetsCount=k.morphTargetsCount,$.numClippingPlanes=k.numClippingPlanes,$.numIntersection=k.numClipIntersection,$.vertexAlphas=k.vertexAlphas,$.vertexTangents=k.vertexTangents,$.toneMapping=k.toneMapping}function wg(E,k,$,K,H){k.isScene!==!0&&(k=ye),Ie.resetTextureUnits();let de=k.fog,Se=K.isMeshStandardMaterial?k.environment:null,Pe=A===null?y.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ht,Ae=(K.isMeshStandardMaterial?Ze:$e).get(K.envMap||Se),He=K.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,Ge=!!$.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Oe=!!$.morphAttributes.position,tt=!!$.morphAttributes.normal,mt=!!$.morphAttributes.color,It=Bi;K.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(It=y.toneMapping);let Mt=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,xt=Mt!==void 0?Mt.length:0,Be=fe.get(K),Tt=p.state.lights;if(pe===!0&&(q===!0||E!==b)){let pn=E===b&&K.id===S;oe.setState(K,E,pn)}let lt=!1;K.version===Be.__version?(Be.needsLights&&Be.lightsStateVersion!==Tt.state.version||Be.outputColorSpace!==Pe||H.isBatchedMesh&&Be.batching===!1||!H.isBatchedMesh&&Be.batching===!0||H.isBatchedMesh&&Be.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&Be.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&Be.instancing===!1||!H.isInstancedMesh&&Be.instancing===!0||H.isSkinnedMesh&&Be.skinning===!1||!H.isSkinnedMesh&&Be.skinning===!0||H.isInstancedMesh&&Be.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&Be.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&Be.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&Be.instancingMorph===!1&&H.morphTexture!==null||Be.envMap!==Ae||K.fog===!0&&Be.fog!==de||Be.numClippingPlanes!==void 0&&(Be.numClippingPlanes!==oe.numPlanes||Be.numIntersection!==oe.numIntersection)||Be.vertexAlphas!==He||Be.vertexTangents!==Ge||Be.morphTargets!==Oe||Be.morphNormals!==tt||Be.morphColors!==mt||Be.toneMapping!==It||Be.morphTargetsCount!==xt)&&(lt=!0):(lt=!0,Be.__version=K.version);let An=Be.currentProgram;lt===!0&&(An=Ao(K,k,H));let Zs=!1,Rn=!1,Kr=!1,At=An.getUniforms(),Bn=Be.uniforms;if(ue.useProgram(An.program)&&(Zs=!0,Rn=!0,Kr=!0),K.id!==S&&(S=K.id,Rn=!0),Zs||b!==E){ue.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),At.setValue(U,"projectionMatrix",E.projectionMatrix),At.setValue(U,"viewMatrix",E.matrixWorldInverse);let xn=At.map.cameraPosition;xn!==void 0&&xn.setValue(U,me.setFromMatrixPosition(E.matrixWorld)),Y.logarithmicDepthBuffer&&At.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&At.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,Rn=!0,Kr=!0)}if(H.isSkinnedMesh){At.setOptional(U,H,"bindMatrix"),At.setOptional(U,H,"bindMatrixInverse");let pn=H.skeleton;pn&&(pn.boneTexture===null&&pn.computeBoneTexture(),At.setValue(U,"boneTexture",pn.boneTexture,Ie))}H.isBatchedMesh&&(At.setOptional(U,H,"batchingTexture"),At.setValue(U,"batchingTexture",H._matricesTexture,Ie),At.setOptional(U,H,"batchingIdTexture"),At.setValue(U,"batchingIdTexture",H._indirectTexture,Ie),At.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&At.setValue(U,"batchingColorTexture",H._colorsTexture,Ie));let kn=$.morphAttributes;if((kn.position!==void 0||kn.normal!==void 0||kn.color!==void 0)&&re.update(H,$,An),(Rn||Be.receiveShadow!==H.receiveShadow)&&(Be.receiveShadow=H.receiveShadow,At.setValue(U,"receiveShadow",H.receiveShadow)),K.isMeshGouraudMaterial&&K.envMap!==null&&(Bn.envMap.value=Ae,Bn.flipEnvMap.value=Ae.isCubeTexture&&Ae.isRenderTargetTexture===!1?-1:1),K.isMeshStandardMaterial&&K.envMap===null&&k.environment!==null&&(Bn.envMapIntensity.value=k.environmentIntensity),Rn&&(At.setValue(U,"toneMappingExposure",y.toneMappingExposure),Be.needsLights&&Eg(Bn,Kr),de&&K.fog===!0&&ee.refreshFogUniforms(Bn,de),ee.refreshMaterialUniforms(Bn,K,G,ne,p.state.transmissionRenderTarget[E.id]),Br.upload(U,qd(Be),Bn,Ie)),K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Br.upload(U,qd(Be),Bn,Ie),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&At.setValue(U,"center",H.center),At.setValue(U,"modelViewMatrix",H.modelViewMatrix),At.setValue(U,"normalMatrix",H.normalMatrix),At.setValue(U,"modelMatrix",H.matrixWorld),K.isShaderMaterial||K.isRawShaderMaterial){let pn=K.uniformsGroups;for(let xn=0,ru=pn.length;xn<ru;xn++){let _s=pn[xn];X.update(_s,An),X.bind(_s,An)}}return An}function Eg(E,k){E.ambientLightColor.needsUpdate=k,E.lightProbe.needsUpdate=k,E.directionalLights.needsUpdate=k,E.directionalLightShadows.needsUpdate=k,E.pointLights.needsUpdate=k,E.pointLightShadows.needsUpdate=k,E.spotLights.needsUpdate=k,E.spotLightShadows.needsUpdate=k,E.rectAreaLights.needsUpdate=k,E.hemisphereLights.needsUpdate=k}function Tg(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,k,$){let K=fe.get(E);K.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),fe.get(E.texture).__webglTexture=k,fe.get(E.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:$,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,k){let $=fe.get(E);$.__webglFramebuffer=k,$.__useDefaultFramebuffer=k===void 0};let Ag=U.createFramebuffer();this.setRenderTarget=function(E,k=0,$=0){A=E,T=k,P=$;let K=!0,H=null,de=!1,Se=!1;if(E){let Ae=fe.get(E);if(Ae.__useDefaultFramebuffer!==void 0)ue.bindFramebuffer(U.FRAMEBUFFER,null),K=!1;else if(Ae.__webglFramebuffer===void 0)Ie.setupRenderTarget(E);else if(Ae.__hasExternalTextures)Ie.rebindTextures(E,fe.get(E.texture).__webglTexture,fe.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Oe=E.depthTexture;if(Ae.__boundDepthTexture!==Oe){if(Oe!==null&&fe.has(Oe)&&(E.width!==Oe.image.width||E.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ie.setupDepthRenderbuffer(E)}}let He=E.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Se=!0);let Ge=fe.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ge[k])?H=Ge[k][$]:H=Ge[k],de=!0):E.samples>0&&Ie.useMultisampledRTT(E)===!1?H=fe.get(E).__webglMultisampledFramebuffer:Array.isArray(Ge)?H=Ge[$]:H=Ge,R.copy(E.viewport),L.copy(E.scissor),F=E.scissorTest}else R.copy(Me).multiplyScalar(G).floor(),L.copy(Re).multiplyScalar(G).floor(),F=Fe;if($!==0&&(H=Ag),ue.bindFramebuffer(U.FRAMEBUFFER,H)&&K&&ue.drawBuffers(E,H),ue.viewport(R),ue.scissor(L),ue.setScissorTest(F),de){let Ae=fe.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ae.__webglTexture,$)}else if(Se){let Ae=k;for(let He=0;He<E.textures.length;He++){let Ge=fe.get(E.textures[He]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+He,Ge.__webglTexture,$,Ae)}}else if(E!==null&&$!==0){let Ae=fe.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ae.__webglTexture,$)}S=-1},this.readRenderTargetPixels=function(E,k,$,K,H,de,Se,Pe=0){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=fe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Se!==void 0&&(Ae=Ae[Se]),Ae){ue.bindFramebuffer(U.FRAMEBUFFER,Ae);try{let He=E.textures[Pe],Ge=He.format,Oe=He.type;if(!Y.textureFormatReadable(Ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Y.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=E.width-K&&$>=0&&$<=E.height-H&&(E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Pe),U.readPixels(k,$,K,H,Te.convert(Ge),Te.convert(Oe),de))}finally{let He=A!==null?fe.get(A).__webglFramebuffer:null;ue.bindFramebuffer(U.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(E,k,$,K,H,de,Se,Pe=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ae=fe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Se!==void 0&&(Ae=Ae[Se]),Ae)if(k>=0&&k<=E.width-K&&$>=0&&$<=E.height-H){ue.bindFramebuffer(U.FRAMEBUFFER,Ae);let He=E.textures[Pe],Ge=He.format,Oe=He.type;if(!Y.textureFormatReadable(Ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Y.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let tt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,tt),U.bufferData(U.PIXEL_PACK_BUFFER,de.byteLength,U.STREAM_READ),E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Pe),U.readPixels(k,$,K,H,Te.convert(Ge),Te.convert(Oe),0);let mt=A!==null?fe.get(A).__webglFramebuffer:null;ue.bindFramebuffer(U.FRAMEBUFFER,mt);let It=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Cp(U,It,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,tt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,de),U.deleteBuffer(tt),U.deleteSync(It),de}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,k=null,$=0){let K=Math.pow(2,-$),H=Math.floor(E.image.width*K),de=Math.floor(E.image.height*K),Se=k!==null?k.x:0,Pe=k!==null?k.y:0;Ie.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,$,0,0,Se,Pe,H,de),ue.unbindTexture()};let Rg=U.createFramebuffer(),Cg=U.createFramebuffer();this.copyTextureToTexture=function(E,k,$=null,K=null,H=0,de=null){de===null&&(H!==0?(_r("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),de=H,H=0):de=0);let Se,Pe,Ae,He,Ge,Oe,tt,mt,It,Mt=E.isCompressedTexture?E.mipmaps[de]:E.image;if($!==null)Se=$.max.x-$.min.x,Pe=$.max.y-$.min.y,Ae=$.isBox3?$.max.z-$.min.z:1,He=$.min.x,Ge=$.min.y,Oe=$.isBox3?$.min.z:0;else{let kn=Math.pow(2,-H);Se=Math.floor(Mt.width*kn),Pe=Math.floor(Mt.height*kn),E.isDataArrayTexture?Ae=Mt.depth:E.isData3DTexture?Ae=Math.floor(Mt.depth*kn):Ae=1,He=0,Ge=0,Oe=0}K!==null?(tt=K.x,mt=K.y,It=K.z):(tt=0,mt=0,It=0);let xt=Te.convert(k.format),Be=Te.convert(k.type),Tt;k.isData3DTexture?(Ie.setTexture3D(k,0),Tt=U.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(Ie.setTexture2DArray(k,0),Tt=U.TEXTURE_2D_ARRAY):(Ie.setTexture2D(k,0),Tt=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,k.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,k.unpackAlignment);let lt=U.getParameter(U.UNPACK_ROW_LENGTH),An=U.getParameter(U.UNPACK_IMAGE_HEIGHT),Zs=U.getParameter(U.UNPACK_SKIP_PIXELS),Rn=U.getParameter(U.UNPACK_SKIP_ROWS),Kr=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,He),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ge),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Oe);let At=E.isDataArrayTexture||E.isData3DTexture,Bn=k.isDataArrayTexture||k.isData3DTexture;if(E.isDepthTexture){let kn=fe.get(E),pn=fe.get(k),xn=fe.get(kn.__renderTarget),ru=fe.get(pn.__renderTarget);ue.bindFramebuffer(U.READ_FRAMEBUFFER,xn.__webglFramebuffer),ue.bindFramebuffer(U.DRAW_FRAMEBUFFER,ru.__webglFramebuffer);for(let _s=0;_s<Ae;_s++)At&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,fe.get(E).__webglTexture,H,Oe+_s),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,fe.get(k).__webglTexture,de,It+_s)),U.blitFramebuffer(He,Ge,Se,Pe,tt,mt,Se,Pe,U.DEPTH_BUFFER_BIT,U.NEAREST);ue.bindFramebuffer(U.READ_FRAMEBUFFER,null),ue.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||E.isRenderTargetTexture||fe.has(E)){let kn=fe.get(E),pn=fe.get(k);ue.bindFramebuffer(U.READ_FRAMEBUFFER,Rg),ue.bindFramebuffer(U.DRAW_FRAMEBUFFER,Cg);for(let xn=0;xn<Ae;xn++)At?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,kn.__webglTexture,H,Oe+xn):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,kn.__webglTexture,H),Bn?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,pn.__webglTexture,de,It+xn):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,pn.__webglTexture,de),H!==0?U.blitFramebuffer(He,Ge,Se,Pe,tt,mt,Se,Pe,U.COLOR_BUFFER_BIT,U.NEAREST):Bn?U.copyTexSubImage3D(Tt,de,tt,mt,It+xn,He,Ge,Se,Pe):U.copyTexSubImage2D(Tt,de,tt,mt,He,Ge,Se,Pe);ue.bindFramebuffer(U.READ_FRAMEBUFFER,null),ue.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Bn?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(Tt,de,tt,mt,It,Se,Pe,Ae,xt,Be,Mt.data):k.isCompressedArrayTexture?U.compressedTexSubImage3D(Tt,de,tt,mt,It,Se,Pe,Ae,xt,Mt.data):U.texSubImage3D(Tt,de,tt,mt,It,Se,Pe,Ae,xt,Be,Mt):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,de,tt,mt,Se,Pe,xt,Be,Mt.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,de,tt,mt,Mt.width,Mt.height,xt,Mt.data):U.texSubImage2D(U.TEXTURE_2D,de,tt,mt,Se,Pe,xt,Be,Mt);U.pixelStorei(U.UNPACK_ROW_LENGTH,lt),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,An),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Zs),U.pixelStorei(U.UNPACK_SKIP_ROWS,Rn),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Kr),de===0&&k.generateMipmaps&&U.generateMipmap(Tt),ue.unbindTexture()},this.initRenderTarget=function(E){fe.get(E).__webglFramebuffer===void 0&&Ie.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?Ie.setTextureCube(E,0):E.isData3DTexture?Ie.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?Ie.setTexture2DArray(E,0):Ie.setTexture2D(E,0),ue.unbindTexture()},this.resetState=function(){T=0,P=0,A=null,ue.reset(),N.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};var hm={type:"change"},Gh={type:"start"},fm={type:"end"},Pc=new li,dm=new on,Ov=Math.cos(70*ft.DEG2RAD),Xt=new C,En=2*Math.PI,_t={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Vh=1e-6,Ic=class extends qa{constructor(e,t=null){super(e,t),this.state=_t.NONE,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ln.ROTATE,MIDDLE:Ln.DOLLY,RIGHT:Ln.PAN},this.touches={ONE:Un.ROTATE,TWO:Un.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new Kt,this._lastTargetPosition=new C,this._quat=new Kt().setFromUnitVectors(e.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ir,this._sphericalDelta=new Ir,this._scale=1,this._panOffset=new C,this._rotateStart=new he,this._rotateEnd=new he,this._rotateDelta=new he,this._panStart=new he,this._panEnd=new he,this._panDelta=new he,this._dollyStart=new he,this._dollyEnd=new he,this._dollyDelta=new he,this._dollyDirection=new C,this._mouse=new he,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Bv.bind(this),this._onPointerDown=zv.bind(this),this._onPointerUp=kv.bind(this),this._onContextMenu=Xv.bind(this),this._onMouseWheel=Gv.bind(this),this._onKeyDown=Wv.bind(this),this._onTouchStart=jv.bind(this),this._onTouchMove=qv.bind(this),this._onMouseDown=Hv.bind(this),this._onMouseMove=Vv.bind(this),this._interceptControlDown=Yv.bind(this),this._interceptControlUp=$v.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(hm),this.update(),this.state=_t.NONE}update(e=null){let t=this.object.position;Xt.copy(t).sub(this.target),Xt.applyQuaternion(this._quat),this._spherical.setFromVector3(Xt),this.autoRotate&&this.state===_t.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=En:n>Math.PI&&(n-=En),s<-Math.PI?s+=En:s>Math.PI&&(s-=En),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Xt.setFromSpherical(this._spherical),Xt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Xt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Xt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new C(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Xt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Pc.origin.copy(this.object.position),Pc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Pc.direction))<Ov?this.object.lookAt(this.target):(dm.setFromNormalAndCoplanarPoint(this.object.up,this.target),Pc.intersectPlane(dm,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Vh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Vh||this._lastTargetPosition.distanceToSquared(this.target)>Vh?(this.dispatchEvent(hm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?En/60*this.autoRotateSpeed*e:En/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Xt.setFromMatrixColumn(t,0),Xt.multiplyScalar(-e),this._panOffset.add(Xt)}_panUp(e,t){this.screenSpacePanning===!0?Xt.setFromMatrixColumn(t,1):(Xt.setFromMatrixColumn(t,0),Xt.crossVectors(this.object.up,Xt)),Xt.multiplyScalar(e),this._panOffset.add(Xt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Xt.copy(s).sub(this.target);let r=Xt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new he,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function zv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function Bv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function kv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(fm),this.state=_t.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Hv(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ln.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=_t.DOLLY;break;case Ln.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_t.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_t.ROTATE}break;case Ln.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_t.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_t.PAN}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Gh)}function Vv(i){switch(this.state){case _t.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case _t.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case _t.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Gv(i){this.enabled===!1||this.enableZoom===!1||this.state!==_t.NONE||(i.preventDefault(),this.dispatchEvent(Gh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(fm))}function Wv(i){this.enabled!==!1&&this._handleKeyDown(i)}function jv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Un.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=_t.TOUCH_ROTATE;break;case Un.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=_t.TOUCH_PAN;break;default:this.state=_t.NONE}break;case 2:switch(this.touches.TWO){case Un.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=_t.TOUCH_DOLLY_PAN;break;case Un.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=_t.TOUCH_DOLLY_ROTATE;break;default:this.state=_t.NONE}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Gh)}function qv(i){switch(this._trackPointer(i),this.state){case _t.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case _t.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case _t.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case _t.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=_t.NONE}}function Xv(i){this.enabled!==!1&&i.preventDefault()}function Yv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function $v(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Dc=class extends Ic{constructor(e,t,{reducedMotion:n=()=>!1}={}){super(e,t),this.enableDamping=!0,this.motionTime=70,this.zoomTime=85,this.reducedMotion=n,this.getMaxZoomDistance=()=>this.maxDistance,this._zoomGoal=null,this._frameTime=null,this._zoomOffset=new C,this._scheduled=!0}update(){return this._scheduled?(this.dispatchEvent({type:"wake"}),!1):super.update()}sync(){return super.update()}rest(){this._frameTime=null}stopMotion(){this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0),this._scale=1,this._zoomGoal=null,this.rest()}clearBlockedPan(e){for(let t of["x","y","z"])Math.abs(e[t])>1e-8&&(this._panOffset[t]=0)}zoomBy(e){if(!Number.isFinite(e)||e<=0)return;let t=this.getDistance(),n=this._zoomGoal!==null&&(e-1)*(this._zoomGoal-t)<0;this._zoomGoal=ft.clamp((n?t:this._zoomGoal??t)*e,this.minDistance,this.getMaxZoomDistance()),this.update()}_dollyIn(e){this.zoomBy(e)}_dollyOut(e){this.zoomBy(1/e)}step(e=performance.now()){let t=this._frameTime===null?16.666666666666668:Math.max(0,e-this._frameTime);this._frameTime=e;let n=Math.min(64,t),s=this.reducedMotion();if(this.dampingFactor=s?1:-Math.expm1(-n/this.motionTime),this._zoomGoal!==null){this._zoomGoal=ft.clamp(this._zoomGoal,this.minDistance,this.getMaxZoomDistance());let o=this.getDistance(),l=s?1:-Math.expm1(-n/this.zoomTime),c=Math.exp(ft.lerp(Math.log(o),Math.log(this._zoomGoal),l));Math.abs(c-this._zoomGoal)<.001&&(c=this._zoomGoal,this._zoomGoal=null),this._zoomOffset.copy(this.object.position).sub(this.target).setLength(c),this.object.position.copy(this.target).add(this._zoomOffset)}let r=super.update(n/1e3),a=this.getPolarAngle();return(a<=this.minPolarAngle+1e-6&&this._sphericalDelta.phi<0||a>=this.maxPolarAngle-1e-6&&this._sphericalDelta.phi>0)&&(this._sphericalDelta.phi=0),r}};function Lc(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new gt,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let g=0;g<f.count;++g)h.push(f.getX(g)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in r){let h=pm(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in a){let h=a[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let _=0;_<a[u].length;++_)f.push(a[u][_][d]);let g=pm(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function pm(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*t}let a=new e(r),o=new ct(a,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let d=0,f=u.count;d<f;d++)for(let g=0;g<t;g++){let _=u.getComponent(d,g);o.setComponent(d+h,g,_)}}else a.set(u.array,l);l+=u.count*t}return s!==void 0&&(o.gpuType=s),o}function Wh(i,e){if(e===gh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Fr||e===to){let t=i.getIndex();if(t===null){let a=[],o=i.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);i.setIndex(a),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Fr)for(let a=1;a<=n;a++)s.push(t.getX(0)),s.push(t.getX(a)),s.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(s.push(t.getX(a)),s.push(t.getX(a+1)),s.push(t.getX(a+2))):(s.push(t.getX(a+2)),s.push(t.getX(a+1)),s.push(t.getX(a)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var Uc=class extends ti{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Kh(t)}),this.register(function(t){return new Jh(t)}),this.register(function(t){return new od(t)}),this.register(function(t){return new ld(t)}),this.register(function(t){return new cd(t)}),this.register(function(t){return new ed(t)}),this.register(function(t){return new td(t)}),this.register(function(t){return new nd(t)}),this.register(function(t){return new id(t)}),this.register(function(t){return new Zh(t)}),this.register(function(t){return new sd(t)}),this.register(function(t){return new Qh(t)}),this.register(function(t){return new ad(t)}),this.register(function(t){return new rd(t)}),this.register(function(t){return new Yh(t)}),this.register(function(t){return new ud(t)}),this.register(function(t){return new hd(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=zi.extractUrlBase(e);a=zi.resolveURL(c,this.path)}else a=zi.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ls(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(u){t(u),r.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===xm){try{a[Qe.KHR_BINARY_GLTF]=new dd(e)}catch(h){s&&s(h);return}r=JSON.parse(a[Qe.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new xd(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[h.name]=h,a[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],d=r.extensionsRequired||[];switch(h){case Qe.KHR_MATERIALS_UNLIT:a[h]=new $h;break;case Qe.KHR_DRACO_MESH_COMPRESSION:a[h]=new fd(r,this.dracoLoader);break;case Qe.KHR_TEXTURE_TRANSFORM:a[h]=new pd;break;case Qe.KHR_MESH_QUANTIZATION:a[h]=new md;break;default:d.indexOf(h)>=0&&o[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function Zv(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var Qe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Yh=class{constructor(e){this.parser=e,this.name=Qe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,u=new De(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],Ht);let h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Fs(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Ga(u),c.distance=h;break;case"spot":c=new Va(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),gi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},$h=class{constructor(){this.name=Qe.KHR_MATERIALS_UNLIT}getMaterialType(){return Jt}extendParams(e,t,n){let s=[];e.color=new De(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Ht),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Rt))}return Promise.all(s)}},Zh=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Kh=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new he(o,o)}return Promise.all(r)}},Jh=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Qh=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}},ed=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new De(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=s.extensions[this.name];if(a.sheenColorFactor!==void 0){let o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Ht)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,Rt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}},td=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}},nd=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new De().setRGB(o[0],o[1],o[2],Ht),Promise.all(r)}},id=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},sd=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new De().setRGB(o[0],o[1],o[2],Ht),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,Rt)),Promise.all(r)}},rd=class{constructor(e){this.parser=e,this.name=Qe.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}},ad=class{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:ln}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}},od=class{constructor(e){this.parser=e,this.name=Qe.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},ld=class{constructor(e){this.parser=e,this.name=Qe.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},cd=class{constructor(e){this.parser=e,this.name=Qe.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},ud=class{constructor(e){this.name=Qe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,u=s.count,h=s.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,h,d,s.mode,s.filter).then(function(f){return f.buffer}):a.ready.then(function(){let f=new ArrayBuffer(u*h);return a.decodeGltfBuffer(new Uint8Array(f),u,h,d,s.mode,s.filter),f})})}else return null}},hd=class{constructor(e){this.name=Qe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==Wn.TRIANGLES&&c.mode!==Wn.TRIANGLE_STRIP&&c.mode!==Wn.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(u=>(l[c]=u,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let u=c.pop(),h=u.isGroup?u.children:[u],d=c[0].count,f=[];for(let g of h){let _=new Ce,m=new C,p=new Kt,M=new C(1,1,1),x=new va(g.geometry,g.material,d);for(let y=0;y<d;y++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,y),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,y),l.SCALE&&M.fromBufferAttribute(l.SCALE,y),x.setMatrixAt(y,_.compose(m,p,M));for(let y in l)if(y==="_COLOR_0"){let w=l[y];x.instanceColor=new es(w.array,w.itemSize,w.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&g.geometry.setAttribute(y,l[y]);Et.prototype.copy.call(x,g),this.parser.assignFinalMaterial(x),f.push(x)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},xm="glTF",io=12,mm={JSON:1313821514,BIN:5130562},dd=class{constructor(e){this.name=Qe.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,io),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==xm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-io,r=new DataView(e,io),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===mm.JSON){let c=new Uint8Array(e,io+a,o);this.content=n.decode(c)}else if(l===mm.BIN){let c=io+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},fd=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Qe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let u in a){let h=_d[u]||u.toLowerCase();o[h]=a[u]}for(let u in e.attributes){let h=_d[u]||u.toLowerCase();if(a[u]!==void 0){let d=n.accessors[e.attributes[u]],f=Vr[d.componentType];c[h]=f.name,l[h]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,d){s.decodeDracoFile(u,function(f){for(let g in f.attributes){let _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}h(f)},o,c,Ht,d)})})}},pd=class{constructor(){this.name=Qe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},md=class{constructor(){this.name=Qe.KHR_MESH_QUANTIZATION}},Nc=class extends Ui{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,u=s-t,h=(n-t)/u,d=h*h,f=d*h,g=e*c,_=g-c,m=-2*f+3*d,p=f-d,M=1-m,x=p-d+h;for(let y=0;y!==o;y++){let w=a[_+y+o],T=a[_+y+l]*u,P=a[g+y+o],A=a[g+y]*u;r[y]=M*w+x*T+m*P+p*A}return r}},Kv=new Kt,gd=class extends Nc{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return Kv.fromArray(r).normalize().toArray(r),r}},Wn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Vr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},gm={9728:Ft,9729:Lt,9984:Vl,9985:Ur,9986:Hs,9987:Sn},_m={33071:Vn,33648:pr,10497:kt},jh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},_d={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},rs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Jv={CUBICSPLINE:void 0,LINEAR:Ts,STEP:Es},qh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Qv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Wt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Qn})),i.DefaultMaterial}function Xs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function gi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function eb(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,u=e.length;c<u;c++){let h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,u=e.length;c<u;c++){let h=e[c];if(n){let d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;a.push(d)}if(s){let d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;o.push(d)}if(r){let d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let u=c[0],h=c[1],d=c[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function tb(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function nb(i){let e,t=i.extensions&&i.extensions[Qe.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Xh(t.attributes):e=i.indices+":"+Xh(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Xh(i.targets[n]);return e}function Xh(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function yd(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function ib(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var sb=new Ce,xd=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Zv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?this.textureLoader=new Us(this.options.manager):this.textureLoader=new Wa(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ls(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return Xs(r,o,s),gi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,u]of a.children.entries())r(u,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Qe.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(zi.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=jh[s.type],o=Vr[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new ct(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=jh[s.type],c=Vr[s.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,_,m;if(f&&f!==h){let p=Math.floor(d/f),M="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,x=t.cache.get(M);x||(_=new c(o,p*f,s.count*f/u),x=new wr(_,f/u),t.cache.add(M,x)),m=new Er(x,l,d%f/u,g)}else o===null?_=new c(s.count*l):_=new c(o,d,s.count*l),m=new ct(_,l,g);if(s.sparse!==void 0){let p=jh.SCALAR,M=Vr[s.sparse.indices.componentType],x=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,w=new M(a[1],x,s.sparse.count*p),T=new c(a[2],y,s.sparse.count*l);o!==null&&(m=new ct(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let P=0,A=w.length;P<A;P++){let S=w[P];if(m.setX(S,T[P*l]),l>=2&&m.setY(S,T[P*l+1]),l>=3&&m.setZ(S,T[P*l+2]),l>=4&&m.setW(S,T[P*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);let d=(r.samplers||{})[a.sampler]||{};return u.magFilter=gm[d.magFilter]||Lt,u.minFilter=gm[d.minFilter]||Sn,u.wrapS=_m[d.wrapS]||kt,u.wrapT=_m[d.wrapT]||kt,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Ft&&u.minFilter!==Lt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(h){c=!0;let d=new Blob([h],{type:a.mimeType});return l=o.createObjectURL(d),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(l).then(function(h){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(_){let m=new $t(_);m.needsUpdate=!0,d(m)}),t.load(zi.resolveURL(h,r.path),g,void 0,f)})}).then(function(h){return c===!0&&o.revokeObjectURL(l),gi(h,a),h.userData.mimeType=a.mimeType||ib(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[Qe.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[Qe.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[Qe.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Ar,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new ui,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Wt}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[Qe.KHR_MATERIALS_UNLIT]){let h=s[Qe.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),c.push(h.extendParams(o,r,t))}else{let h=r.pbrMetallicRoughness||{};if(o.color=new De(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Ht),o.opacity=d[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",h.baseColorTexture,Rt)),o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=Mn);let u=r.alphaMode||qh.OPAQUE;if(u===qh.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===qh.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Jt&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new he(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;o.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&a!==Jt&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Jt){let h=r.emissiveFactor;o.emissive=new De().setRGB(h[0],h[1],h[2],Ht)}return r.emissiveTexture!==void 0&&a!==Jt&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Rt)),Promise.all(c).then(function(){let h=new a(o);return r.name&&(h.name=r.name),gi(h,r),t.associations.set(h,{materials:e}),r.extensions&&Xs(s,h,r),h})}createUniqueName(e){let t=vt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[Qe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return ym(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],u=nb(c),h=s[u];if(h)a.push(h.promise);else{let d;c.extensions&&c.extensions[Qe.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=ym(new gt,c,t),s[u]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let u=a[l].material===void 0?Qv(this.cache):this.getDependency("material",a[l].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let f=0,g=u.length;f<g;f++){let _=u[f],m=a[f],p,M=c[f];if(m.mode===Wn.TRIANGLES||m.mode===Wn.TRIANGLE_STRIP||m.mode===Wn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new ya(_,M):new it(_,M),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Wn.TRIANGLE_STRIP?p.geometry=Wh(p.geometry,to):m.mode===Wn.TRIANGLE_FAN&&(p.geometry=Wh(p.geometry,Fr));else if(m.mode===Wn.LINES)p=new Di(_,M);else if(m.mode===Wn.LINE_STRIP)p=new Cs(_,M);else if(m.mode===Wn.LINE_LOOP)p=new ba(_,M);else if(m.mode===Wn.POINTS)p=new Ma(_,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&tb(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),gi(p,r),m.extensions&&Xs(s,p,m),t.assignFinalMaterial(p),h.push(p)}for(let f=0,g=h.length;f<g;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return r.extensions&&Xs(s,h[0],r),h[0];let d=new Bt;r.extensions&&Xs(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=h.length;f<g;f++)d.add(h[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Dt(ft.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Oi(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),gi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,u=a.length;c<u;c++){let h=a[c];if(h){o.push(h);let d=new Ce;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new xa(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],u=[];for(let h=0,d=s.channels.length;h<d;h++){let f=s.channels[h],g=s.samplers[f.sampler],_=f.target,m=_.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,M=s.parameters!==void 0?s.parameters[g.output]:g.output;_.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",M)),c.push(g),u.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],g=h[2],_=h[3],m=h[4],p=[];for(let x=0,y=d.length;x<y;x++){let w=d[x],T=f[x],P=g[x],A=_[x],S=m[x];if(w===void 0)continue;w.updateMatrix&&w.updateMatrix();let b=n._createAnimationTracks(w,T,P,A,S);if(b)for(let R=0;R<b.length;R++)p.push(b[R])}let M=new za(r,void 0,p);return gi(M,s),M})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,u=o.length;c<u;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let u=c[0],h=c[1],d=c[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,sb)});for(let f=0,g=h.length;f<g;f++)u.add(h[f]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let u;if(r.isBone===!0?u=new Tr:c.length>1?u=new Bt:c.length===1?u=c[0]:u=new Et,u!==c[0])for(let h=0,d=c.length;h<d;h++)u.add(c[h]);if(r.name&&(u.userData.name=r.name,u.name=a),gi(u,r),r.extensions&&Xs(n,u,r),r.matrix!==void 0){let h=new Ce;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let h=s.associations.get(u);s.associations.set(u,{...h})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Bt;n.name&&(r.name=s.createUniqueName(n.name)),gi(r,n),n.extensions&&Xs(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let u=0,h=l.length;u<h;u++)r.add(l[u]);let c=u=>{let h=new Map;for(let[d,f]of s.associations)(d instanceof gn||d instanceof $t)&&h.set(d,f);return u.traverse(d=>{let f=s.associations.get(d);f!=null&&h.set(d,f)}),h};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];rs[r.path]===rs.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(o);let c;switch(rs[r.path]){case rs.weights:c=hi;break;case rs.rotation:c=di;break;case rs.translation:case rs.scale:c=fi;break;default:switch(n.itemSize){case 1:c=hi;break;case 2:case 3:default:c=fi;break}break}let u=s.interpolation!==void 0?Jv[s.interpolation]:Ts,h=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){let g=new c(l[d]+"."+rs[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),a.push(g)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=yd(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof di?gd:Nc;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function rb(i,e,t){let n=e.attributes,s=new Gt;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new C(l[0],l[1],l[2]),new C(c[0],c[1],c[2])),o.normalized){let u=yd(Vr[o.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new C,l=new C;for(let c=0,u=r.length;c<u;c++){let h=r[c];if(h.POSITION!==void 0){let d=t.json.accessors[h.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let _=yd(Vr[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new vn;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function ym(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=_d[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return Je.workingColorSpace!==Ht&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Je.workingColorSpace}" not supported.`),gi(i,e),rb(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?eb(i,e.targets,t):i})}function vm(i={now:()=>performance.now(),request:t=>requestAnimationFrame(t),cancel:t=>cancelAnimationFrame(t),delay:(t,n)=>setTimeout(t,n),clear:t=>clearTimeout(t),foreground:()=>document.visibilityState==="visible"&&document.hasFocus(),subscribe:t=>{let n=()=>t(!1),s=()=>t(document.visibilityState==="visible"&&document.hasFocus());return window.addEventListener("blur",n),document.addEventListener("visibilitychange",s),()=>{window.removeEventListener("blur",n),document.removeEventListener("visibilitychange",s)}}},e=5e3){if(!Number.isFinite(e)||e<5e3||e>6e4)throw new RangeError("Frame sampling duration must be between 5000 and 60000 ms");return new Promise(t=>{let n=[],s=i.now(),r=120,a=e+5e3,o=null,l=null,c=null,u=!1,h=i.foreground(),d=0,f=i.subscribe(p=>{p||(h=!1,d++)});function g(p){if(u)return;u=!0,i.clear(m),c!==null&&i.cancel(c),f();let M=[...n].sort((w,T)=>w-T),x=l===null?0:o-l,y=w=>M.length?+M[Math.min(M.length-1,Math.floor(M.length*w))].toFixed(2):null;t({schemaVersion:2,sampleCount:n.length,requestedSamples:r,minimumDurationMs:e,timeoutMs:a,elapsedMs:Math.round(i.now()-s),sampleDurationMs:+x.toFixed(2),medianMs:y(.5),p95Ms:y(.95),maxMs:y(1),averageFps:x?+(n.length*1e3/x).toFixed(2):null,intervalsOver50Ms:n.filter(w=>w>50).length,intervalsOver100Ms:n.filter(w=>w>100).length,intervalsMs:n.map(w=>+w.toFixed(3)),continuouslyForeground:h,foregroundInterruptions:d,timedOut:p,valid:n.length>=r&&x>=e&&h&&!p,method:`Consecutive requestAnimationFrame intervals for at least ${e/1e3} seconds and 120 samples; no long frames discarded; ${a/1e3}-second timeout. Browser callback timing, not GPU-only render cost.`})}function _(p){h=h&&i.foreground(),l===null&&(l=p),o!==null&&n.push(p-o),o=p,n.length>=r&&p-l>=e?g(!1):c=i.request(_)}let m=i.delay(()=>g(!0),a);c=i.request(_)})}function bm({render:i,onIdle:e=()=>{},onError:t=r=>{throw r},request:n=r=>requestAnimationFrame(r),cancel:s=r=>cancelAnimationFrame(r)}){let r=null,a=!1,o=!1,l=!1,c=!1;function u(){!c&&!a&&r===null&&(r=n(d))}function h(){c||(o=!0,u())}function d(f){r=null,a=!0,o=!1;let g=!1;try{g=!!i(f)}catch(_){c=!0,l=!1,o=!1,t(_)}finally{a=!1}c||(l||o||g?u():e())}return{invalidate:h,setContinuous(f){c||(l=!!f,l&&h())},get idle(){return!a&&r===null&&!l},dispose(){c=!0,l=!1,o=!1,r!==null&&s(r),r=null}}}function Mm(i,e){let t=e.position.clone(),n=e.quaternion.clone(),s=i.target.clone(),r=!1;return{get updating(){return r},update(a){t.copy(e.position),n.copy(e.quaternion),s.copy(i.target);let o=e.zoom;r=!0;try{i.step?i.step(a):i.update()}finally{r=!1}return t.distanceToSquared(e.position)>1e-12||s.distanceToSquared(i.target)>1e-12||n.angleTo(e.quaternion)>1e-6||Math.abs(o-e.zoom)>1e-9}}}async function Sm(i,e={now:()=>performance.now(),delay:n=>new Promise(s=>setTimeout(s,n)),foreground:()=>document.visibilityState==="visible"&&document.hasFocus(),subscribe:n=>{let s=()=>n(!1),r=()=>n(document.visibilityState==="visible"&&document.hasFocus());return window.addEventListener("blur",s),document.addEventListener("visibilitychange",r),()=>{window.removeEventListener("blur",s),document.removeEventListener("visibilitychange",r)}}},t=2e3){let n=e.now(),s=e.foreground(),r=0,a=e.subscribe(o=>{o||(s=!1,r++)});try{for(;!i().idle&&e.now()-n<5e3;)await e.delay(50);let o=i(),l=e.now();o.idle&&await e.delay(t);let c=i(),u=e.now()-l;s=s&&e.foreground();let h=o.idle&&s&&u>=t,d=c.renderedFrames-o.renderedFrames;return{method:"Wait up to 5 seconds for demand rendering to settle, then observe actual renderer.render calls for at least 2 seconds. No animation callbacks requested by this audit.",minimumDurationMs:t,settleElapsedMs:+(l-n).toFixed(2),elapsedMs:+u.toFixed(2),before:o,after:c,drawsDuringIdle:d,continuouslyForeground:s,foregroundInterruptions:r,valid:h,status:h?d===0&&c.idle?"PASS":"FAIL":"INCONCLUSIVE"}}finally{a()}}var Fc="S1.214",ab=new Set(["building","building_detail","d6_screen"]),wm=new WeakMap;function as(i){for(let e=i;e;e=e.parent)if(e.userData.id||e.userData.kind)return e.userData;return{}}function Em(i){let e=i.object.userData.triangleFeatures;if(!e){let s=as(i.object);if(s.kind!=="building_batch")return s;let r=i.object.geometry,a=r?.getAttribute("_bnbu_id"),o=s.building_index_ids,l=i.faceIndex;if(!a||!Array.isArray(o)||!Number.isInteger(l)||l<0)return{};let c=l*3,u=r.index?.count??r.attributes.position.count;if(c+2>=u)return{};let h=[0,1,2].map(g=>r.index?r.index.getX(c+g):c+g),d=a.getX(h[0]);if(!Number.isInteger(d)||d<1||d>o.length||!h.every(g=>a.getX(g)===d))return{};let f=wm.get(i.object);return f||(f=new Map,wm.set(i.object,f)),f.has(d)||f.set(d,{kind:"building",id:o[d-1],phase:s.phase,lod:s.lod,construction_status:s.construction_status,building_id_source:"_BNBU_ID"}),f.get(d)}if(!Number.isInteger(i.faceIndex)||i.faceIndex<0)return{};let t=0,n=e.length-1;for(;t<=n;){let s=t+n>>1,r=e[s];if(i.faceIndex<r.firstTriangle)n=s-1;else if(i.faceIndex>=r.firstTriangle+r.triangleCount)t=s+1;else return r.feature}return{}}function vd(i){return(i.index?.count??i.attributes.position.count)/3}function ob(i,e){let t=i.geometry;return ab.has(e.kind)&&(e.id||e.building_id)&&!i.isSkinnedMesh&&!i.isInstancedMesh&&!Array.isArray(i.material)&&!i.material.transparent&&!Object.keys(t.morphAttributes).length&&t.drawRange.start===0&&t.drawRange.count===1/0&&t.groups.length===0&&i.matrixWorld.determinant()>0&&Number.isInteger(vd(t))}function Tm(i){i.updateMatrixWorld(!0);let e=new Bt;e.name=i.name;let t=new Map,n=0,s=0,r=0;i.traverse(o=>{if(!o.isMesh)return;n++,s+=vd(o.geometry);let l=as(o);if(!ob(o,l)){let h=o.clone(!1);h.matrix.copy(o.matrixWorld),h.matrixAutoUpdate=!1,h.userData={...l,...o.userData},e.add(h);return}let c=Object.entries(o.geometry.attributes).map(([h,d])=>[h,d.itemSize,d.normalized,d.array.constructor.name]).sort(),u=JSON.stringify([l.phase,l.construction_status,l.height_status,o.material.uuid,!!o.geometry.index,c,o.renderOrder,o.layers.mask]);t.has(u)||t.set(u,[]),t.get(u).push({object:o,feature:l}),r++});let a=0;for(let o of t.values()){let l=o.map(({object:g})=>g.geometry.clone().applyMatrix4(g.matrixWorld)),c=Lc(l,!1);if(!c)throw Error("Campus batch has incompatible vertex attributes");let u=o[0],h=new it(c,u.object.material);h.name=`Campus runtime ${u.feature.phase} ${u.feature.height_status} ${u.object.material.name}`,h.renderOrder=u.object.renderOrder,h.layers.mask=u.object.layers.mask;let d=0,f=o.map(({feature:g},_)=>{let m=vd(l[_]),p={firstTriangle:d,triangleCount:m,feature:g};return d+=m,p});h.userData={kind:"building_runtime_batch",phase:u.feature.phase,height_status:u.feature.height_status,construction_status:u.feature.construction_status,triangleFeatures:f},c.computeBoundingBox(),c.computeBoundingSphere(),l.forEach(g=>g.dispose()),a+=d,e.add(h)}return e.userData.runtimeBatching={version:Fc,inputMeshes:n,outputMeshes:e.children.length,batchInputMeshes:r,batchOutputMeshes:t.size,inputTriangles:s,batchedTriangles:a,featureRanges:[...e.children].reduce((o,l)=>o+(l.userData.triangleFeatures?.length??0),0)},e}async function Am(i,e,t,n){let s=new Set,r=new Set;i.traverse(c=>{if(!c.isMesh)return;let u=e.get(c),h=u?.normalMap;if(!h)return;r.add(h);let d=c.userData.triangleFeatures?.map(f=>f.feature)||[as(c)];for(let f of d)s.add(f.id)});let a=[];for(let c of r){let u=c.image,h=document.createElement("canvas");h.width=u.width,h.height=u.height;let d=h.getContext("2d",{willReadFrequently:!0});d.drawImage(u,0,0);let f=d.getImageData(0,0,u.width,u.height).data,g=[...new Uint8Array(await crypto.subtle.digest("SHA-256",f))].map(_=>_.toString(16).padStart(2,"0")).join("");a.push({width:u.width,height:u.height,rgbaSha256:g,noColorConversion:c.colorSpace===Fn,repeat:c.wrapS===kt&&c.wrapT===kt})}let o=t<2?n.building_ids:[],l=[...s].sort();return{pass:JSON.stringify(l)===JSON.stringify(o)&&a.length===(t<2?1:0)&&a.every(c=>c.width===128&&c.height===128&&c.rgbaSha256===n.image.rgba_sha256&&c.noColorConversion&&c.repeat),texturedBuildingIds:l,images:a,physicalMaterialMeasured:!1}}var bd=[1.8,.65,.24];function Md(i,e=null){let t=e??bd.filter(n=>i<n).length;for(;t<3&&i<bd[t]*.9;)t++;for(;t>0&&i>bd[t-1]*1.1;)t--;return t}function Rm(i){let e=i.display_name||i.name||"",t=i.tags||{};return/学习资源|图书馆|体育馆|大学会堂|高等研究院|会同古村/.test(e)||["town","village","suburb"].includes(t.place)?0:i.kind!=="poi"?1:t.emergency||["bench","bicycle_parking","waste_disposal","waste_basket","recycling","parking_entrance"].includes(t.amenity)||/停车场入口|垃圾|消防栓|失物招领/.test(e)||/^(出入口|入口|道闸)$/.test(e)?3:i.category==="entrance"||t.natural==="water"||t.water||["park","garden"].includes(t.leisure)||/中心湖|大碧池/.test(e)?1:i.category==="office"||["facility","other"].includes(i.category)?3:2}function Cm(i,e,{selected:t=!1,focused:n=!1}={}){return t?"selected":n?"name":e===0?i===0?"name":"hidden":e===1?i<=1?"name":i===2?"icon":"hidden":i<=e?"name":"hidden"}function Pm(i,e,t){let n=Math.max(.45,Math.min(1.35,e*t/85e4));return Math.round([12,22,32,42][i]*n)}function Im(i){let e=i.tags||{};return i.kind!=="poi"?"building":i.road||e.highway==="road"?"road":e.natural==="water"||e.water||/中心湖|大碧池/.test(i.name)?"water":{dining:"dining",shop:"shop",transport:"bus",health:"medical",facility:"pin",office:"building",leisure:"leaf",culture:"culture",entrance:"gate"}[i.category]||"pin"}var Sd=[["all","\u5168\u90E8"],["learning","\u6559\u5B66"],["residence","\u4F4F\u5BBF"],["culture","\u6587\u5316"],["sport","\u8FD0\u52A8"],["service","\u5176\u4ED6"]];function Oc(i){let e=i.display_name||i.name;return/^[VD]\d+\b/.test(e)?"residence":/^T\d+\b|学习资源|研究院/.test(e)?"learning":/体育|运动/.test(e)?"sport":/会堂|演艺|文化/.test(e)?"culture":"service"}var Dm=i=>String(i||"").normalize("NFKC").toLowerCase().replace(/\s+/g,"");function lb(i,{query:e="",category:t="all",phase:n="all",construction:s=!0}={}){let r=String(e).trim().split(/\s+/).map(Dm).filter(Boolean);return i.filter(a=>{if(n!=="all"&&a.phase!==n||!s&&a.construction_status==="construction_unverified"||t!=="all"&&Oc(a)!==t)return!1;let o=/学习资源中心/.test(a.name)?"\u56FE\u4E66\u9986 library tushuguan tsg":"",l=Sd.find(([u])=>u===Oc(a))[1],c=Dm(`${hu(a)} ${l} ${o} ${a.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"}`);return r.every(u=>c.includes(u))})}function Lm({buildings:i,places:e=[],camera:t,controls:n,stage:s,choose:r,invalidate:a,getState:o,onScopeChange:l=()=>{}}){let c=Y=>document.querySelector(Y),u=c("#building-search"),h=c("#search-results"),d=c("#map-labels"),f="all",g="buildings",_="",m=null,p=i,M=-1,x="",y=30,w=[...i,...e.filter(Y=>!i.some(ue=>ue.id===Y.id))],T=new Set,P=new Set,A=[],S=!0,b=[],R=null,L=c("#show-labels"),F=c("#scale-bar"),z=c("#scale-bar i"),V=c("#scale-text"),B=[...document.querySelectorAll("header,.explore,.detail,.map-tools,.view-dock,.render-studio,.qa,footer,.map-hint")],ne=()=>{S=!0,a()},G=new ResizeObserver(ne);B.forEach(Y=>G.observe(Y)),G.observe(s);let le=new MutationObserver(ne);B.forEach(Y=>le.observe(Y,{attributes:!0,attributeFilter:["hidden","class"]})),window.addEventListener("resize",ne);let ce=new Map(w.map(Y=>[Y.id,new C(Y.centroid[0],Y.kind==="poi"?Y.labelHeight:Y.base_elevation_m+(Y.display_height_m??Y.height_m)+3,-Y.centroid[1])])),Me=document.createElement("canvas").getContext("2d");Me.font="600 14px "+getComputedStyle(d).fontFamily;let Re=w.filter(Y=>!/^未命名/.test(Y.name)).map(Y=>{let ue=document.createElement("button");ue.className="map-label",ue.hidden=!0;let ke=Y.display_name||Y.name,fe=Rm(Y),Ie=document.createElement("span");Ie.className="map-label-symbol",Ie.append(Ks(Im(Y)));let $e=document.createElement("span");$e.className="map-label-text",$e.textContent=ke,ue.append(Ie,$e),ue.title=`${Y.nearby?"\u5468\u8FB9":Y.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${ke}${Y.floor?" \xB7 "+Y.floor+"\u5C42":""}`,ue.dataset.placeId=Y.id,ue.dataset.rank=fe,ue.setAttribute("aria-label",`\u5B9A\u4F4D${ue.title}`),ue.dataset.category=Y.kind==="poi"?Y.category:Oc(Y),Y.kind==="poi"&&ue.classList.add("place-label"),ue.addEventListener("click",()=>r(Y)),d.appendChild(ue);let Ze=Math.min(202,Math.ceil(Me.measureText(ke).width)+37);return{b:Y,button:ue,point:ce.get(Y.id),width:Ze,rank:fe}});function Fe(){c("#building-categories").replaceChildren();for(let[Y,ue]of g!=="buildings"?ri:Sd){let ke=document.createElement("button");ke.textContent=ue,ke.dataset.category=Y,ke.setAttribute("aria-pressed",String(Y===f)),ke.addEventListener("click",()=>{f=Y,x="",y=30,pe()}),c("#building-categories").appendChild(ke)}}function Ve(Y){g=Y,f="all",_="",x="",y=30,m=null,c("#place-floor").value="",c(".explore").classList.remove("has-selection"),document.querySelectorAll("[data-search-scope]").forEach(ue=>ue.setAttribute("aria-pressed",String(ue.dataset.searchScope===g))),l(g),Fe(),pe()}document.querySelectorAll("[data-search-scope]").forEach(Y=>Y.addEventListener("click",()=>Ve(Y.dataset.searchScope))),c("#place-floor").addEventListener("change",()=>{_=c("#place-floor").value,pe()}),c("#place-type").addEventListener("change",()=>{x=c("#place-type").value,y=30,pe()}),c("#clear-within").addEventListener("click",()=>{m=null,pe()}),Fe();function pe(){let Y=o(),ue=lb(i,{query:u.value,category:g==="buildings"?f:"all",phase:Y.view,construction:Y.construction}),ke=g==="buildings"&&!!u.value.trim()&&Y.view==="all",fe=tf(e.filter(v=>ke||(g==="nearby"?v.nearby:!v.nearby)),{query:u.value,category:g!=="buildings"?f:"all",phase:g==="nearby"||ke?"all":Y.view,floor:_,position:Y.location});Y.placeCategories&&(fe=fe.filter(v=>Y.placeCategories.has(v.category))),m&&(fe=fe.filter(v=>v.building_id===m));let Ie=c("#place-type");Ie.replaceChildren(new Option("\u5168\u90E8\u7C7B\u578B",""));let $e=[...new Set(fe.map(v=>Wi(v.tags)))];for(let v of $e)Ie.add(new Option(`${Xn[v]} \xB7 ${fe.filter(O=>Wi(O.tags)===v).length}`,v));x&&!$e.includes(x)&&(x=""),Ie.value=x,x&&(fe=fe.filter(v=>Wi(v.tags)===x)),p=g!=="buildings"?fe:u.value.trim()&&f==="all"?[...ue,...fe.filter(v=>!ue.some(O=>O.id===v.id))]:ue,Y.location&&p.sort((v,O)=>Math.hypot(v.centroid[0]-Y.location[0],v.centroid[1]-Y.location[1])-Math.hypot(O.centroid[0]-Y.location[0],O.centroid[1]-Y.location[1])),Y.favoritesOnly&&(p=p.filter(v=>Y.favorites?.has(v.id))),T=new Set(p.map(v=>v.id)),P=of(e,Y,{query:u.value,scope:g,category:f}),A=[...Re].sort((v,O)=>v.rank-O.rank||+(v.b.kind==="poi")-+(O.b.kind==="poi")||v.b.id.localeCompare(O.b.id)),c("#clear-search").hidden=!u.value,c("#building-categories").querySelectorAll("button").forEach(v=>v.setAttribute("aria-pressed",String(v.dataset.category===f)));let Ze=!!(u.value.trim()||f!=="all"||g!=="buildings"||Y.favoritesOnly);h.hidden=!Ze,M=-1;let D=e.filter(v=>!v.nearby&&!i.some(O=>O.id===v.id)&&(Y.view==="all"||v.phase===Y.view));if(c("#search-summary").textContent=Ze?`${p.length} \u5904\u7ED3\u679C \xB7 ${Y.location?"\u6309\u76F4\u7EBF\u8DDD\u79BB\u6392\u5E8F":"\u70B9\u51FB\u5B9A\u4F4D"}`:`${p.length} \u680B\u5EFA\u7B51 \xB7 ${D.length} \u5904\u6821\u56ED\u5730\u70B9`,c("#place-filters").hidden=g==="buildings",c("#place-floor-field").hidden=g!=="places",c("#place-type-field").hidden=g==="buildings",c("#clear-within").hidden=!m,h.replaceChildren(),Ze&&!p.length){let v=document.createElement("p");v.textContent="\u6CA1\u6709\u5339\u914D\u7684\u5730\u70B9\uFF0C\u53EF\u5C1D\u8BD5\u697C\u53F7\u3001\u4E2D\u6587\u3001\u82F1\u6587\u6216\u62FC\u97F3\uFF0C\u4E5F\u53EF\u8C03\u6574\u7C7B\u522B\u4E0E\u697C\u5C42\u3002",h.appendChild(v)}if(Ze)for(let v of p.slice(0,y)){let O=document.createElement("button");O.className="search-result";let J=document.createElement("span");J.textContent=v.display_name||v.name;let ee=document.createElement("small"),W=v.kind==="poi"?ri.find(([ge])=>ge===v.category)[1]:Sd.find(([ge])=>ge===Oc(v))[1],_e=Y.location?`${Math.round(Math.hypot(v.centroid[0]-Y.location[0],v.centroid[1]-Y.location[1]))}m \xB7 `:"";ee.textContent=`${_e}${v.nearby?"\u5468\u8FB9":v.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${W}${v.building_name&&!/^未命名/.test(v.building_name)?" \xB7 "+v.building_name:""}${v.floor?" \xB7 "+v.floor+"\u5C42":""}`;let oe=document.createElement("span");oe.className="result-symbol",oe.append(Ks(v.kind==="poi"?"pin":"building"));let xe=document.createElement("span");xe.className="result-copy",xe.append(J,ee),O.append(oe,xe,Ks("arrow")),O.addEventListener("click",()=>r(v)),h.appendChild(O)}if(Ze&&p.length>y){let v=document.createElement("button");v.className="wide-action",v.textContent=`\u518D\u663E\u793A ${Math.min(30,p.length-y)} \u5904 \xB7 \u4F59 ${p.length-y} \u5904`,v.onclick=()=>{let O=h.scrollTop;y+=30,pe(),h.scrollTop=O},h.appendChild(v)}ne()}u.addEventListener("input",()=>{y=30,c(".explore").classList.remove("has-selection"),pe()}),c("#clear-search").addEventListener("click",()=>{c(".explore").classList.remove("has-selection"),u.value="",pe(),u.focus()}),u.addEventListener("keydown",Y=>{let ue=[...h.querySelectorAll("button")];if(Y.key==="Escape"){u.value="",f="all",pe();return}ue.length&&((Y.key==="ArrowDown"||Y.key==="ArrowUp")&&(Y.preventDefault(),M=(M+(Y.key==="ArrowDown"?1:-1)+ue.length)%ue.length,ue.forEach((ke,fe)=>ke.classList.toggle("keyboard-active",fe===M)),ue[M].scrollIntoView({block:"nearest"})),Y.key==="Enter"&&(Y.preventDefault(),ue[Math.max(0,M)].click()))}),c("#show-labels").addEventListener("change",a),c(".display-settings").addEventListener("toggle",ne),c("#qa-tools").addEventListener("toggle",ne);let q=new C,Z=new C,me=new C,Ee=new on(new C(0,1,0),0),ye=new Os,Le=new C,dt=new C,U=new he(-.1,0),at=new he(.1,0);function ze(){let Y=o(),ue=s.clientWidth,ke=s.clientHeight;S&&(b=B.filter(ee=>!ee.hidden).map(ee=>ee.getBoundingClientRect()),S=!1);let fe=[];t.getWorldDirection(Z);let Ie=t.position.distanceTo(n.target),$e=2*Math.tan(t.fov*Math.PI/360)/ke;R=Md(Ie*$e,R),d.dataset.zoomLevel=["overview","campus","local","detail"][R];let Ze=Pm(R,ue,ke),D=!!(u.value.trim()||f!=="all"||x||_||m||Y.favoritesOnly),v=Y.selected?[...A.filter(ee=>ee.b.id===Y.selected),...A.filter(ee=>ee.b.id!==Y.selected)]:A;for(let{b:ee,button:W,point:_e,width:oe,rank:xe}of v){let ge=()=>{W.hidden||(W.hidden=!0)},re=ee.id===Y.selected;if(ee.nearby&&!Y.surroundingsEnabled){ge();continue}if(!L.checked||!T.has(ee.id)&&!P.has(ee.id)&&!re||Y.labels===!1){ge();continue}if(P.has(ee.id)&&!re&&Math.hypot(_e.x-n.target.x,_e.z-n.target.z)>Math.max(250,Ie*1.1)){ge();continue}me.copy(_e).sub(t.position);let ve=me.dot(Z);if(ve<=0){ge();continue}let Ue=Math.min(R,Md(ve*$e,R)),Te=Cm(xe,Ue,{selected:re,focused:D&&T.has(ee.id)});if(Te==="hidden"||!re&&fe.length>=Ze){ge();continue}if(q.copy(_e).project(t),q.z<-1||q.z>1){ge();continue}let N=(q.x+1)*ue/2,X=(1-q.y)*ke/2,I=re?34:28,j=Te==="icon"?28:oe+(re?15:0),ie={left:N-j/2,right:N+j/2,top:X-I-8,bottom:X-8};if(ie.left<8||ie.right>ue-8||ie.top<8||ie.bottom>ke-8){ge();continue}let se={...ie,bottom:re?X:ie.bottom},ae=re?9:R<2?12:7,te=Ne=>se.left<Ne.right+ae&&se.right>Ne.left-ae&&se.top<Ne.bottom+ae&&se.bottom>Ne.top-ae;if(b.some(te)||fe.some(te)){ge();continue}fe.push(se),W.hidden&&(W.hidden=!1),W.classList.toggle("selected",re),W.setAttribute("aria-pressed",String(re)),W.dataset.labelMode!==Te&&(W.dataset.labelMode=Te),W.style.width=`${j}px`,W.style.height=`${I}px`;let we=`translate3d(${(N-j/2).toFixed(2)}px,${(X-I-8).toFixed(2)}px,0)`;W.style.transform!==we&&(W.style.transform=we)}ye.setFromCamera(U,t);let O=ye.ray.intersectPlane(Ee,Le);ye.setFromCamera(at,t);let J=ye.ray.intersectPlane(Ee,dt);if(F.hidden=!O||!J,O&&J){let ee=O.distanceTo(J)/(.1*ue),W=ee*90,_e=10**Math.floor(Math.log10(W)),oe=[1,2,5,10].map(re=>re*_e).filter(re=>re<=W).pop()||_e,xe=`${(oe/ee).toFixed(1)}px`,ge=`\u7EA6 ${oe>=1e3?`${oe/1e3} km`:`${oe} m`}`;z.style.width!==xe&&(z.style.width=xe),V.textContent!==ge&&(V.textContent=ge)}}return pe(),{refresh:pe,update:ze,setScope:Ve,showInside(Y){Ve("places"),m=Y,u.value="",pe()},get scope(){return g}}}function Um({camera:i,controls:e,invalidate:t,reducedMotion:n=()=>matchMedia("(prefers-reduced-motion: reduce)").matches}){let s=null;function r(){s=null}e.addEventListener("start",r);function a(c,u,h=!0){if(e.stopMotion)e.stopMotion();else{let d=i.position.clone(),f=e.target.clone(),g=e.enableDamping;e.enableDamping=!1,e.update(),i.position.copy(d),e.target.copy(f),e.update(),e.enableDamping=g}if(!h||n()){s=null,i.position.copy(c),e.target.copy(u),o(),t();return}s={from:i.position.clone(),to:c.clone(),fromTarget:e.target.clone(),toTarget:u.clone(),start:performance.now(),duration:620},t()}function o(){e.sync?e.sync():e.update()}function l(c){if(!s)return!1;let u=Math.min(1,Math.max(0,(c-s.start)/s.duration)),h=u*u*(3-2*u);return i.position.lerpVectors(s.from,s.to,h),e.target.lerpVectors(s.fromTarget,s.toTarget,h),o(),u===1&&(s=null),!!s}return{move:a,update:l,cancel:r,get active(){return!!s}}}function Nm(i,e){let t=null,n=6500,s=new C,r=new C,a=new C;return e.minDistance=45,e.maxDistance=6500,e.minPolarAngle=0,e.maxPolarAngle=ft.degToRad(78),e.screenSpacePanning=!1,{setRegion(o,l){t={minX:o[0]-120,maxX:o[2]+120,minZ:-o[3]-120,maxZ:-o[1]+120},n=Math.min(6500,Math.max(900,l*1.6))},constrain(){if(!t)return;s.copy(e.target),e.target.x=ft.clamp(e.target.x,t.minX,t.maxX),e.target.y=ft.clamp(e.target.y,0,80),e.target.z=ft.clamp(e.target.z,t.minZ,t.maxZ),r.copy(e.target).sub(s),i.position.add(r),e.clearBlockedPan?.(r),a.copy(i.position).sub(e.target);let o=a.length(),l=ft.clamp(o,e.minDistance,n);o>0&&Math.abs(o-l)>1e-8&&i.position.copy(e.target).addScaledVector(a,l/o),i.updateMatrixWorld()},get maxDistance(){return n},get bounds(){return t?{...t}:null}}}function wd(i,e){let t=e==="pan";i.mouseButtons.LEFT=t?Ln.PAN:Ln.ROTATE,i.mouseButtons.RIGHT=t?Ln.ROTATE:Ln.PAN,i.touches.ONE=t?Un.PAN:Un.ROTATE,i.touches.TWO=t?Un.DOLLY_ROTATE:Un.DOLLY_PAN}var en=class i extends it{constructor(e,t={}){super(e),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this.camera=new Dt;let n=this,s=t.color!==void 0?new De(t.color):new De(8355711),r=t.textureWidth||512,a=t.textureHeight||512,o=t.clipBias||0,l=t.shader||i.ReflectorShader,c=t.multisample!==void 0?t.multisample:4,u=new on,h=new C,d=new C,f=new C,g=new Ce,_=new C(0,0,-1),m=new nt,p=new C,M=new C,x=new nt,y=new Ce,w=this.camera,T=new Vt(r,a,{samples:c,type:Ut}),P=new St({name:l.name!==void 0?l.name:"unspecified",uniforms:hn.clone(l.uniforms),fragmentShader:l.fragmentShader,vertexShader:l.vertexShader});P.uniforms.tDiffuse.value=T.texture,P.uniforms.color.value=s,P.uniforms.textureMatrix.value=y,this.material=P,this.onBeforeRender=function(A,S,b){if(d.setFromMatrixPosition(n.matrixWorld),f.setFromMatrixPosition(b.matrixWorld),g.extractRotation(n.matrixWorld),h.set(0,0,1),h.applyMatrix4(g),p.subVectors(d,f),p.dot(h)>0===!0&&this.forceUpdate===!1)return;p.reflect(h).negate(),p.add(d),g.extractRotation(b.matrixWorld),_.set(0,0,-1),_.applyMatrix4(g),_.add(f),M.subVectors(d,_),M.reflect(h).negate(),M.add(d),w.position.copy(p),w.up.set(0,1,0),w.up.applyMatrix4(g),w.up.reflect(h),w.lookAt(M),w.far=b.far,w.updateMatrixWorld(),w.projectionMatrix.copy(b.projectionMatrix),y.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),y.multiply(w.projectionMatrix),y.multiply(w.matrixWorldInverse),y.multiply(n.matrixWorld),u.setFromNormalAndCoplanarPoint(h,d),u.applyMatrix4(w.matrixWorldInverse),m.set(u.normal.x,u.normal.y,u.normal.z,u.constant);let L=w.projectionMatrix;x.x=(Math.sign(m.x)+L.elements[8])/L.elements[0],x.y=(Math.sign(m.y)+L.elements[9])/L.elements[5],x.z=-1,x.w=(1+L.elements[10])/L.elements[14],m.multiplyScalar(2/m.dot(x)),L.elements[2]=m.x,L.elements[6]=m.y,L.elements[10]=m.z+1-o,L.elements[14]=m.w,n.visible=!1;let F=A.getRenderTarget(),z=A.xr.enabled,V=A.shadowMap.autoUpdate;A.xr.enabled=!1,A.shadowMap.autoUpdate=!1,A.setRenderTarget(T),A.state.buffers.depth.setMask(!0),A.autoClear===!1&&A.clear(),A.render(S,w),A.xr.enabled=z,A.shadowMap.autoUpdate=V,A.setRenderTarget(F);let B=b.viewport;B!==void 0&&A.state.viewport(B),n.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return T},this.dispose=function(){T.dispose(),n.material.dispose()}}};en.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
    uniform mat4 textureMatrix;
    varying vec4 vUv;

    #include <common>
    #include <logdepthbuf_pars_vertex>

    void main() {

      vUv = textureMatrix * vec4( position, 1.0 );

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      #include <logdepthbuf_vertex>

    }`,fragmentShader:`
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    varying vec4 vUv;

    #include <logdepthbuf_pars_fragment>

    float blendOverlay( float base, float blend ) {

      return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

    }

    vec3 blendOverlay( vec3 base, vec3 blend ) {

      return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

    }

    void main() {

      #include <logdepthbuf_fragment>

      vec4 base = texture2DProj( tDiffuse, vUv );
      gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

      #include <tonemapping_fragment>
      #include <colorspace_fragment>

    }`};var os={campusGroundMap:{value:null},campusGroundMatrix:{value:new Ce},campusGroundAvailable:{value:0}},Fm=`
uniform sampler2D campusGroundMap;
uniform mat4 campusGroundMatrix;
uniform float campusGroundAvailable;
vec4 campusGroundReflection(vec3 world,float roughness){
  vec4 projected=campusGroundMatrix*vec4(world,1.);
  vec2 uv=projected.xy/max(projected.w,.0001);
  float valid=step(.0001,projected.w)*smoothstep(0.,.06,uv.x)*smoothstep(0.,.06,uv.y)
    *smoothstep(0.,.06,1.-uv.x)*smoothstep(0.,.06,1.-uv.y);
  // Mip filtering integrates the reflected scene over a rough specular lobe.
  // An additional wide filter avoids sharp building silhouettes on wet stone.
  float lod=2.+roughness*3.;
  vec2 spread=vec2(.003,.006)*(1.+roughness*2.);
  vec3 c=texture2D(campusGroundMap,uv,lod).rgb*.28;
  c+=.12*(texture2D(campusGroundMap,uv+vec2(spread.x,0.),lod).rgb+texture2D(campusGroundMap,uv-vec2(spread.x,0.),lod).rgb
    +texture2D(campusGroundMap,uv+vec2(0.,spread.y),lod).rgb+texture2D(campusGroundMap,uv-vec2(0.,spread.y),lod).rgb);
  c+=.06*(texture2D(campusGroundMap,uv+spread,lod).rgb+texture2D(campusGroundMap,uv-spread,lod).rgb
    +texture2D(campusGroundMap,uv+vec2(spread.x,-spread.y),lod).rgb+texture2D(campusGroundMap,uv+vec2(-spread.x,spread.y),lod).rgb);
  return vec4(c,valid*campusGroundAvailable);
}
`;function Om({renderer:i,scene:e,camera:t}){let n=new en(new Li(1,1),{textureWidth:1024,textureHeight:1024,multisample:0,clipBias:1e-4});n.rotation.x=-Math.PI/2,n.position.y=.12,n.updateMatrixWorld(!0);let s=n.getRenderTarget();s.texture.generateMipmaps=!0,s.texture.minFilter=Sn,os.campusGroundMap.value=s.texture;let r=!0,a=!1,o=0,l=new Ce,c=new Ce;return{invalidate(){r=!0},prepare({moving:u,quality:h,strength:d,wetness:f}){if(os.campusGroundAvailable.value=0,!(h==="balanced"||d<=0||f<=0||t.position.y<.3)){if(!u&&(r||!l.equals(t.matrixWorld)||!c.equals(t.projectionMatrix))){let g=[];e.traverse(M=>{M.visible&&(M.isReflector||M.isLine||M.isLineSegments)&&(g.push(M),M.visible=!1)});let _=i.getRenderTarget(),m=i.xr.enabled,p=i.shadowMap.autoUpdate;try{os.campusGroundMap.value=null,n.onBeforeRender(i,e,t),os.campusGroundMatrix.value.copy(n.material.uniforms.textureMatrix.value).multiply(n.matrixWorld.clone().invert()),l.copy(t.matrixWorld),c.copy(t.projectionMatrix),a=!0,r=!1,o++}finally{os.campusGroundMap.value=s.texture,g.forEach(M=>M.visible=!0),i.setRenderTarget(_),i.xr.enabled=m,i.shadowMap.autoUpdate=p}}os.campusGroundAvailable.value=a?Math.min(1,d):0}},get diagnostics(){return{updates:o,resolution:1024,scenePassesPerCapture:1,mode:"rough planar ground with environment fallback",geometryModified:!1}}}}var so={clear:{label:"\u6674\u5929",cloud:0,sun:1,ambient:1,fog:0,color:13952237},cloudy:{label:"\u591A\u4E91",cloud:.75,sun:.32,ambient:1.65,fog:9e-5,color:12897747},rain:{label:"\u96E8\u5929",cloud:1,sun:.12,ambient:1.5,fog:22e-5,color:10728640},mist:{label:"\u8584\u96FE",cloud:.5,sun:.5,ambient:1.5,fog:65e-5,color:14082016}};function zm({scene:i,camera:e,controls:t,visuals:n,invalidate:s}){let a=new Float32Array(10800),o=new Float32Array(1800*3);for(let x=0;x<o.length;x++)o[x]=Math.random();let l=new gt;l.setAttribute("position",new ct(a,3).setUsage(yh));let c=new ui({color:13034226,transparent:!0,opacity:.46,depthWrite:!1}),u=new Di(l,c);u.name="Simulated rainfall",u.frustumCulled=!1,u.visible=!1,u.raycast=()=>{},i.add(u);let h=document.querySelector("#weather"),d=document.querySelector("#weather-motion"),f=document.querySelector("#weather-note"),g=matchMedia("(prefers-reduced-motion: reduce)");d.checked=!g.matches;let _="clear",m=0,p=null;try{let x=localStorage.getItem("campus-weather");Object.hasOwn(so,x)&&(_=x)}catch{}function M(){h.value=_,u.visible=_==="rain",d.disabled=_!=="rain",f.textContent=`${so[_].label} \xB7 \u6A21\u62DF\u6548\u679C${_==="rain"&&!d.checked?" \xB7 \u96E8\u4E1D\u5DF2\u6682\u505C":""}`,n.setWeather(_),p=null;try{localStorage.setItem("campus-weather",_)}catch{}s()}return h.addEventListener("change",()=>{_=h.value,M()}),d.addEventListener("change",M),g.addEventListener("change",()=>{d.checked=!g.matches,M()}),document.addEventListener("visibilitychange",()=>{p=null,s()}),M(),{update(x,y=!1){let w=_==="rain"&&d.checked&&!document.hidden&&!y;if(w&&p!==null&&(m+=Math.min(.05,Math.max(0,(x-p)/1e3))),p=w?x:null,_!=="rain")return!1;let T=ft.clamp(e.position.distanceTo(t.target)*1.4,150,6500),P=T*.65;for(let A=0;A<1800;A++){let S=A*3,b=A*6,R=((o[S+1]-m*.3)%1+1)%1,L=t.target.x+(o[S]-.5)*T,F=t.target.z+(o[S+2]-.5)*T;a[b]=L,a[b+1]=4+R*P,a[b+2]=F,a[b+3]=L-T*.0018,a[b+4]=a[b+1]+T*.009,a[b+5]=F}return l.attributes.position.needsUpdate=!0,w},get mode(){return _}}}var ro=class i extends it{constructor(){let e=i.SkyShader,t=new St({name:e.name,uniforms:hn.clone(e.uniforms),vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,side:Qt,depthWrite:!1});super(new Qi(1,1,1),t),this.isSky=!0}};ro.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new C},up:{value:new C(0,1,0)}},vertexShader:`
    uniform vec3 sunPosition;
    uniform float rayleigh;
    uniform float turbidity;
    uniform float mieCoefficient;
    uniform vec3 up;

    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;

    // constants for atmospheric scattering
    const float e = 2.71828182845904523536028747135266249775724709369995957;
    const float pi = 3.141592653589793238462643383279502884197169;

    // wavelength of used primaries, according to preetham
    const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
    // this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
    // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
    const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

    // mie stuff
    // K coefficient for the primaries
    const float v = 4.0;
    const vec3 K = vec3( 0.686, 0.678, 0.666 );
    // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
    const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

    // earth shadow hack
    // cutoffAngle = pi / 1.95;
    const float cutoffAngle = 1.6110731556870734;
    const float steepness = 1.5;
    const float EE = 1000.0;

    float sunIntensity( float zenithAngleCos ) {
      zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
      return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
    }

    vec3 totalMie( float T ) {
      float c = ( 0.2 * T ) * 10E-18;
      return 0.434 * c * MieConst;
    }

    void main() {

      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      gl_Position.z = gl_Position.w; // set z to camera.far

      vSunDirection = normalize( sunPosition );

      vSunE = sunIntensity( dot( vSunDirection, up ) );

      vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

      float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

      // extinction (absorption + out scattering)
      // rayleigh coefficients
      vBetaR = totalRayleigh * rayleighCoefficient;

      // mie coefficients
      vBetaM = totalMie( turbidity ) * mieCoefficient;

    }`,fragmentShader:`
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;

    uniform float mieDirectionalG;
    uniform vec3 up;

    // constants for atmospheric scattering
    const float pi = 3.141592653589793238462643383279502884197169;

    const float n = 1.0003; // refractive index of air
    const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

    // optical length at zenith for molecules
    const float rayleighZenithLength = 8.4E3;
    const float mieZenithLength = 1.25E3;
    // 66 arc seconds -> degrees, and the cosine of that
    const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

    // 3.0 / ( 16.0 * pi )
    const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
    // 1.0 / ( 4.0 * pi )
    const float ONE_OVER_FOURPI = 0.07957747154594767;

    float rayleighPhase( float cosTheta ) {
      return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
    }

    float hgPhase( float cosTheta, float g ) {
      float g2 = pow( g, 2.0 );
      float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
      return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
    }

    void main() {

      vec3 direction = normalize( vWorldPosition - cameraPosition );

      // optical length
      // cutoff angle at 90 to avoid singularity in next formula.
      float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
      float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
      float sR = rayleighZenithLength * inverse;
      float sM = mieZenithLength * inverse;

      // combined extinction factor
      vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

      // in scattering
      float cosTheta = dot( direction, vSunDirection );

      float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
      vec3 betaRTheta = vBetaR * rPhase;

      float mPhase = hgPhase( cosTheta, mieDirectionalG );
      vec3 betaMTheta = vBetaM * mPhase;

      vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
      Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

      // nightsky
      float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
      float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
      vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
      vec3 L0 = vec3( 0.1 ) * Fex;

      // composition + solar disc
      float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
      L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

      vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

      vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

      gl_FragColor = vec4( retColor, 1.0 );

      #include <tonemapping_fragment>
      #include <colorspace_fragment>

    }`};var zc=class extends Ba{constructor(e){super(e),this.type=Ut}parse(e){let a=function(A,S){switch(A){case 1:throw new Error("THREE.HDRLoader: Read Error: "+(S||""));case 2:throw new Error("THREE.HDRLoader: Write Error: "+(S||""));case 3:throw new Error("THREE.HDRLoader: Bad File Format: "+(S||""));default:case 4:throw new Error("THREE.HDRLoader: Memory Error: "+(S||""))}},h=function(A,S,b){S=S||1024;let L=A.pos,F=-1,z=0,V="",B=String.fromCharCode.apply(null,new Uint16Array(A.subarray(L,L+128)));for(;0>(F=B.indexOf(`
`))&&z<S&&L<A.byteLength;)V+=B,z+=B.length,L+=128,B+=String.fromCharCode.apply(null,new Uint16Array(A.subarray(L,L+128)));return-1<F?(b!==!1&&(A.pos+=z+F+1),V+B.slice(0,F)):!1},d=function(A){let S=/^#\?(\S+)/,b=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,R=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,L=/^\s*FORMAT=(\S+)\s*$/,F=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,z={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},V,B;for((A.pos>=A.byteLength||!(V=h(A)))&&a(1,"no header found"),(B=V.match(S))||a(3,"bad initial token"),z.valid|=1,z.programtype=B[1],z.string+=V+`
`;V=h(A),V!==!1;){if(z.string+=V+`
`,V.charAt(0)==="#"){z.comments+=V+`
`;continue}if((B=V.match(b))&&(z.gamma=parseFloat(B[1])),(B=V.match(R))&&(z.exposure=parseFloat(B[1])),(B=V.match(L))&&(z.valid|=2,z.format=B[1]),(B=V.match(F))&&(z.valid|=4,z.height=parseInt(B[1],10),z.width=parseInt(B[2],10)),z.valid&2&&z.valid&4)break}return z.valid&2||a(3,"missing format specifier"),z.valid&4||a(3,"missing image size specifier"),z},f=function(A,S,b){let R=S;if(R<8||R>32767||A[0]!==2||A[1]!==2||A[2]&128)return new Uint8Array(A);R!==(A[2]<<8|A[3])&&a(3,"wrong scanline width");let L=new Uint8Array(4*S*b);L.length||a(4,"unable to allocate buffer space");let F=0,z=0,V=4*R,B=new Uint8Array(4),ne=new Uint8Array(V),G=b;for(;G>0&&z<A.byteLength;){z+4>A.byteLength&&a(1),B[0]=A[z++],B[1]=A[z++],B[2]=A[z++],B[3]=A[z++],(B[0]!=2||B[1]!=2||(B[2]<<8|B[3])!=R)&&a(3,"bad rgbe scanline format");let le=0,ce;for(;le<V&&z<A.byteLength;){ce=A[z++];let Re=ce>128;if(Re&&(ce-=128),(ce===0||le+ce>V)&&a(3,"bad scanline data"),Re){let Fe=A[z++];for(let Ve=0;Ve<ce;Ve++)ne[le++]=Fe}else ne.set(A.subarray(z,z+ce),le),le+=ce,z+=ce}let Me=R;for(let Re=0;Re<Me;Re++){let Fe=0;L[F]=ne[Re+Fe],Fe+=R,L[F+1]=ne[Re+Fe],Fe+=R,L[F+2]=ne[Re+Fe],Fe+=R,L[F+3]=ne[Re+Fe],F+=4}G--}return L},g=function(A,S,b,R){let L=A[S+3],F=Math.pow(2,L-128)/255;b[R+0]=A[S+0]*F,b[R+1]=A[S+1]*F,b[R+2]=A[S+2]*F,b[R+3]=1},_=function(A,S,b,R){let L=A[S+3],F=Math.pow(2,L-128)/255;b[R+0]=Ji.toHalfFloat(Math.min(A[S+0]*F,65504)),b[R+1]=Ji.toHalfFloat(Math.min(A[S+1]*F,65504)),b[R+2]=Ji.toHalfFloat(Math.min(A[S+2]*F,65504)),b[R+3]=Ji.toHalfFloat(1)},m=new Uint8Array(e);m.pos=0;let p=d(m),M=p.width,x=p.height,y=f(m.subarray(m.pos),M,x),w,T,P;switch(this.type){case cn:P=y.length/4;let A=new Float32Array(P*4);for(let b=0;b<P;b++)g(y,b*4,A,b*4);w=A,T=cn;break;case Ut:P=y.length/4;let S=new Uint16Array(P*4);for(let b=0;b<P;b++)_(y,b*4,S,b*4);w=S,T=Ut;break;default:throw new Error("THREE.HDRLoader: Unsupported type: "+this.type)}return{width:M,height:x,data:w,header:p.string,gamma:p.gamma,exposure:p.exposure,type:T}}setDataType(e){return this.type=e,this}load(e,t,n,s){function r(a,o){switch(a.type){case cn:case Ut:a.colorSpace=Ht,a.minFilter=Lt,a.magFilter=Lt,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,r,n,s)}};var Gr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,fragmentShader:`

    uniform float opacity;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main() {

      vec4 texel = texture2D( tDiffuse, vUv );
      gl_FragColor = opacity * texel;


    }`};var On=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},cb=new Oi(-1,1,1,-1,0,1),Ed=class extends gt{constructor(){super(),this.setAttribute("position",new ut([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ut([0,2,0,0,2,0],2))}},ub=new Ed,ls=class{constructor(e){this._mesh=new it(ub,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,cb)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Bc=class extends On{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof St?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=hn.clone(e.uniforms),this.material=new St({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ls(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var ao=class extends On{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},kc=class extends On{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Hc=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new he);this._width=n.width,this._height=n.height,t=new Vt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ut}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Bc(Gr),this.copyPass.material.blending=Ot,this.clock=new ja}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ao!==void 0&&(a instanceof ao?n=!0:a instanceof kc&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new he);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Vc=class extends On{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new De}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var oo={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new he},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Ce},cameraProjectionMatrixInverse:{value:new Ce},cameraWorldMatrix:{value:new Ce},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new C(-1,-1,-1)},sceneBoxMax:{value:new C(1,1,1)}},vertexShader:`

    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,fragmentShader:`
    varying vec2 vUv;
    uniform highp sampler2D tNormal;
    uniform highp sampler2D tDepth;
    uniform sampler2D tNoise;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform mat4 cameraProjectionMatrix;
    uniform mat4 cameraProjectionMatrixInverse;
    uniform mat4 cameraWorldMatrix;
    uniform float radius;
    uniform float distanceExponent;
    uniform float thickness;
    uniform float distanceFallOff;
    uniform float scale;
    #if SCENE_CLIP_BOX == 1
      uniform vec3 sceneBoxMin;
      uniform vec3 sceneBoxMax;
    #endif

    #include <common>
    #include <packing>

    #ifndef FRAGMENT_OUTPUT
    #define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
    #endif

    vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
      vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
      vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
      return viewSpacePosition.xyz / viewSpacePosition.w;
    }

    float getDepth(const vec2 uv) {
      return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
    }

    float fetchDepth(const ivec2 uv) {
      return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
    }

    float getViewZ(const in float depth) {
      #if PERSPECTIVE_CAMERA == 1
        return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
      #else
        return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
      #endif
    }

    vec3 computeNormalFromDepth(const vec2 uv) {
      vec2 size = vec2(textureSize(tDepth, 0));
      ivec2 p = ivec2(uv * size);
      float c0 = fetchDepth(p);
      float l2 = fetchDepth(p - ivec2(2, 0));
      float l1 = fetchDepth(p - ivec2(1, 0));
      float r1 = fetchDepth(p + ivec2(1, 0));
      float r2 = fetchDepth(p + ivec2(2, 0));
      float b2 = fetchDepth(p - ivec2(0, 2));
      float b1 = fetchDepth(p - ivec2(0, 1));
      float t1 = fetchDepth(p + ivec2(0, 1));
      float t2 = fetchDepth(p + ivec2(0, 2));
      float dl = abs((2.0 * l1 - l2) - c0);
      float dr = abs((2.0 * r1 - r2) - c0);
      float db = abs((2.0 * b1 - b2) - c0);
      float dt = abs((2.0 * t1 - t2) - c0);
      vec3 ce = getViewPosition(uv, c0).xyz;
      vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
      vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
      return normalize(cross(dpdx, dpdy));
    }

    vec3 getViewNormal(const vec2 uv) {
      #if NORMAL_VECTOR_TYPE == 2
        return normalize(textureLod(tNormal, uv, 0.).rgb);
      #elif NORMAL_VECTOR_TYPE == 1
        return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
      #else
        return computeNormalFromDepth(uv);
      #endif
    }

    vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
      vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
      vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
      float sampleSceneDepth = getDepth(sampleUv);
      return vec3(sampleUv, sampleSceneDepth);
    }

    void main() {
      float depth = getDepth(vUv.xy);
      if (depth >= 1.0) {
        discard;
        return;
      }
      vec3 viewPos = getViewPosition(vUv, depth);
      vec3 viewNormal = getViewNormal(vUv);

      float radiusToUse = radius;
      float distanceFalloffToUse = thickness;
      #if SCREEN_SPACE_RADIUS == 1
        float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
        radiusToUse *= radiusScale;
        distanceFalloffToUse *= radiusScale;
      #endif

      #if SCENE_CLIP_BOX == 1
        vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
        float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
        if (boxDistance > radiusToUse) {
          discard;
          return;
        }
      #endif

      vec2 noiseResolution = vec2(textureSize(tNoise, 0));
      vec2 noiseUv = vUv * resolution / noiseResolution;
      vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
      vec3 tangent = normalize(vec3(randomVec.xy, 0.));
      vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
      mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

      const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
      const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
      float ao = 0.0;
      for (int i = 0; i < DIRECTIONS; ++i) {

        float angle = float(i) / float(DIRECTIONS) * PI;
        vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
        sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

        vec3 viewDir = normalize(-viewPos.xyz);
        vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
        vec3 sliceTangent = cross(sliceBitangent, viewDir);
        vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

        vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
        vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

        for (int j = 0; j < STEPS; ++j) {
          vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

          vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
          vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
          vec3 viewDelta = sampleSceneViewPos - viewPos;
          if (abs(viewDelta.z) < thickness) {
            float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
            cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
          }

          sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
          sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
          viewDelta = sampleSceneViewPos - viewPos;
          if (abs(viewDelta.z) < thickness) {
            float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
            cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
          }
        }

        vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
        float nx = dot(normalInSlice, sliceTangent);
        float ny = dot(normalInSlice, viewDir);
        float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
        float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
        float occlusion = nx * nxb + ny * nyb;
        ao += occlusion;
      }

      ao = clamp(ao / float(DIRECTIONS), 0., 1.);
    #if SCENE_CLIP_BOX == 1
      ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
    #endif
      ao = pow(ao, scale);

      gl_FragColor = FRAGMENT_OUTPUT;
    }`},lo={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,fragmentShader:`
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    varying vec2 vUv;

    #include <packing>

    float getLinearDepth( const in vec2 screenPosition ) {
      #if PERSPECTIVE_CAMERA == 1
        float fragCoordZ = texture2D( tDepth, screenPosition ).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
      #else
        return texture2D( tDepth, screenPosition ).x;
      #endif
    }

    void main() {
      float depth = getLinearDepth( vUv );
      gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

    }`},Gc={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,fragmentShader:`
    uniform float intensity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D( tDiffuse, vUv );
      gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
    }`};function Bm(i=5){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=hb(e),n=t.length,s=new Uint8Array(n*4);for(let a=0;a<n;++a){let o=t[a],l=2*Math.PI*o/n,c=new C(Math.cos(l),Math.sin(l),0).normalize();s[a*4]=(c.x*.5+.5)*255,s[a*4+1]=(c.y*.5+.5)*255,s[a*4+2]=127,s[a*4+3]=255}let r=new ci(s,e,e);return r.wrapS=kt,r.wrapT=kt,r.needsUpdate=!0,r}function hb(i){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=e*e,n=Array(t).fill(0),s=Math.floor(e/2),r=e-1;for(let a=1;a<=t;){if(s===-1&&r===e?(r=e-2,s=0):(r===e&&(r=0),s<0&&(s=e-1)),n[s*e+r]!==0){r-=2,s++;continue}else n[s*e+r]=a++;r++,s--}return n}var co={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Td(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new he},cameraProjectionMatrixInverse:{value:new Ce},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,fragmentShader:`

    varying vec2 vUv;

    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform sampler2D tNoise;
    uniform vec2 resolution;
    uniform mat4 cameraProjectionMatrixInverse;
    uniform float lumaPhi;
    uniform float depthPhi;
    uniform float normalPhi;
    uniform float radius;
    uniform int index;

    #include <common>
    #include <packing>

    #ifndef SAMPLE_LUMINANCE
    #define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
    #endif

    #ifndef FRAGMENT_OUTPUT
    #define FRAGMENT_OUTPUT vec4(denoised, 1.)
    #endif

    float getLuminance(const in vec3 a) {
      return SAMPLE_LUMINANCE;
    }

    const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

    vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
      vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
      vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
      return viewSpacePosition.xyz / viewSpacePosition.w;
    }

    float getDepth(const vec2 uv) {
    #if DEPTH_VALUE_SOURCE == 1
      return textureLod(tDepth, uv.xy, 0.0).a;
    #else
      return textureLod(tDepth, uv.xy, 0.0).r;
    #endif
    }

    float fetchDepth(const ivec2 uv) {
      #if DEPTH_VALUE_SOURCE == 1
        return texelFetch(tDepth, uv.xy, 0).a;
      #else
        return texelFetch(tDepth, uv.xy, 0).r;
      #endif
    }

    vec3 computeNormalFromDepth(const vec2 uv) {
      vec2 size = vec2(textureSize(tDepth, 0));
      ivec2 p = ivec2(uv * size);
      float c0 = fetchDepth(p);
      float l2 = fetchDepth(p - ivec2(2, 0));
      float l1 = fetchDepth(p - ivec2(1, 0));
      float r1 = fetchDepth(p + ivec2(1, 0));
      float r2 = fetchDepth(p + ivec2(2, 0));
      float b2 = fetchDepth(p - ivec2(0, 2));
      float b1 = fetchDepth(p - ivec2(0, 1));
      float t1 = fetchDepth(p + ivec2(0, 1));
      float t2 = fetchDepth(p + ivec2(0, 2));
      float dl = abs((2.0 * l1 - l2) - c0);
      float dr = abs((2.0 * r1 - r2) - c0);
      float db = abs((2.0 * b1 - b2) - c0);
      float dt = abs((2.0 * t1 - t2) - c0);
      vec3 ce = getViewPosition(uv, c0).xyz;
      vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
                  : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
      vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
                  : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
      return normalize(cross(dpdx, dpdy));
    }

    vec3 getViewNormal(const vec2 uv) {
    #if NORMAL_VECTOR_TYPE == 2
      return normalize(textureLod(tNormal, uv, 0.).rgb);
    #elif NORMAL_VECTOR_TYPE == 1
      return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
    #else
      return computeNormalFromDepth(uv);
    #endif
    }

    void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
      vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
      float sampleDepth = getDepth(sampleUv);
      vec3 sampleNormal = getViewNormal(sampleUv);
      vec3 neighborColor = sampleTexel.rgb;
      vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

      float normalDiff = dot(viewNormal, sampleNormal);
      float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
      float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
      float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
      float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
      float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
      float w = lumaSimilarity * depthSimilarity * normalSimilarity;

      denoised += w * neighborColor;
      totalWeight += w;
    }

    void main() {
      float depth = getDepth(vUv.xy);
      vec3 viewNormal = getViewNormal(vUv);
      if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
        discard;
        return;
      }
      vec4 texel = textureLod(tDiffuse, vUv, 0.0);
      vec3 center = texel.rgb;
      vec3 viewPos = getViewPosition(vUv, depth);

      vec2 noiseResolution = vec2(textureSize(tNoise, 0));
      vec2 noiseUv = vUv * resolution / noiseResolution;
      vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
          vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
        mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

      float totalWeight = 1.0;
      vec3 denoised = texel.rgb;
      for (int i = 0; i < SAMPLES; i++) {
        vec3 sampleDir = poissonDisk[i];
        vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
        vec2 sampleUv = vUv + offset;
        denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
      }

      if (totalWeight > 0.) {
        denoised /= totalWeight;
      }
      gl_FragColor = FRAGMENT_OUTPUT;
    }`};function Td(i,e,t){let n=db(i,e,t),s="vec3[SAMPLES](";for(let r=0;r<i;r++){let a=n[r];s+=`vec3(${a.x}, ${a.y}, ${a.z})${r<i-1?",":")"}`}return s}function db(i,e,t){let n=[];for(let s=0;s<i;s++){let r=2*Math.PI*e*s/i,a=Math.pow(s/(i-1),t);n.push(new C(Math.cos(r),Math.sin(r),a))}return n}var Wc=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,s,r,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,l=Math.floor(e+o),c=Math.floor(t+o),u=(3-Math.sqrt(3))/6,h=(l+c)*u,d=l-h,f=c-h,g=e-d,_=t-f,m,p;g>_?(m=1,p=0):(m=0,p=1);let M=g-m+u,x=_-p+u,y=g-1+2*u,w=_-1+2*u,T=l&255,P=c&255,A=this.perm[T+this.perm[P]]%12,S=this.perm[T+m+this.perm[P+p]]%12,b=this.perm[T+1+this.perm[P+1]]%12,R=.5-g*g-_*_;R<0?n=0:(R*=R,n=R*R*this._dot(this.grad3[A],g,_));let L=.5-M*M-x*x;L<0?s=0:(L*=L,s=L*L*this._dot(this.grad3[S],M,x));let F=.5-y*y-w*w;return F<0?r=0:(F*=F,r=F*F*this._dot(this.grad3[b],y,w)),70*(n+s+r)}noise3d(e,t,n){let s,r,a,o,c=(e+t+n)*.3333333333333333,u=Math.floor(e+c),h=Math.floor(t+c),d=Math.floor(n+c),f=1/6,g=(u+h+d)*f,_=u-g,m=h-g,p=d-g,M=e-_,x=t-m,y=n-p,w,T,P,A,S,b;M>=x?x>=y?(w=1,T=0,P=0,A=1,S=1,b=0):M>=y?(w=1,T=0,P=0,A=1,S=0,b=1):(w=0,T=0,P=1,A=1,S=0,b=1):x<y?(w=0,T=0,P=1,A=0,S=1,b=1):M<y?(w=0,T=1,P=0,A=0,S=1,b=1):(w=0,T=1,P=0,A=1,S=1,b=0);let R=M-w+f,L=x-T+f,F=y-P+f,z=M-A+2*f,V=x-S+2*f,B=y-b+2*f,ne=M-1+3*f,G=x-1+3*f,le=y-1+3*f,ce=u&255,Me=h&255,Re=d&255,Fe=this.perm[ce+this.perm[Me+this.perm[Re]]]%12,Ve=this.perm[ce+w+this.perm[Me+T+this.perm[Re+P]]]%12,pe=this.perm[ce+A+this.perm[Me+S+this.perm[Re+b]]]%12,q=this.perm[ce+1+this.perm[Me+1+this.perm[Re+1]]]%12,Z=.6-M*M-x*x-y*y;Z<0?s=0:(Z*=Z,s=Z*Z*this._dot3(this.grad3[Fe],M,x,y));let me=.6-R*R-L*L-F*F;me<0?r=0:(me*=me,r=me*me*this._dot3(this.grad3[Ve],R,L,F));let Ee=.6-z*z-V*V-B*B;Ee<0?a=0:(Ee*=Ee,a=Ee*Ee*this._dot3(this.grad3[pe],z,V,B));let ye=.6-ne*ne-G*G-le*le;return ye<0?o=0:(ye*=ye,o=ye*ye*this._dot3(this.grad3[q],ne,G,le)),32*(s+r+a+o)}noise4d(e,t,n,s){let r=this.grad4,a=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,u,h,d,f,g,_=(e+t+n+s)*l,m=Math.floor(e+_),p=Math.floor(t+_),M=Math.floor(n+_),x=Math.floor(s+_),y=(m+p+M+x)*c,w=m-y,T=p-y,P=M-y,A=x-y,S=e-w,b=t-T,R=n-P,L=s-A,F=S>b?32:0,z=S>R?16:0,V=b>R?8:0,B=S>L?4:0,ne=b>L?2:0,G=R>L?1:0,le=F+z+V+B+ne+G,ce=a[le][0]>=3?1:0,Me=a[le][1]>=3?1:0,Re=a[le][2]>=3?1:0,Fe=a[le][3]>=3?1:0,Ve=a[le][0]>=2?1:0,pe=a[le][1]>=2?1:0,q=a[le][2]>=2?1:0,Z=a[le][3]>=2?1:0,me=a[le][0]>=1?1:0,Ee=a[le][1]>=1?1:0,ye=a[le][2]>=1?1:0,Le=a[le][3]>=1?1:0,dt=S-ce+c,U=b-Me+c,at=R-Re+c,ze=L-Fe+c,Y=S-Ve+2*c,ue=b-pe+2*c,ke=R-q+2*c,fe=L-Z+2*c,Ie=S-me+3*c,$e=b-Ee+3*c,Ze=R-ye+3*c,D=L-Le+3*c,v=S-1+4*c,O=b-1+4*c,J=R-1+4*c,ee=L-1+4*c,W=m&255,_e=p&255,oe=M&255,xe=x&255,ge=o[W+o[_e+o[oe+o[xe]]]]%32,re=o[W+ce+o[_e+Me+o[oe+Re+o[xe+Fe]]]]%32,ve=o[W+Ve+o[_e+pe+o[oe+q+o[xe+Z]]]]%32,Ue=o[W+me+o[_e+Ee+o[oe+ye+o[xe+Le]]]]%32,Te=o[W+1+o[_e+1+o[oe+1+o[xe+1]]]]%32,N=.6-S*S-b*b-R*R-L*L;N<0?u=0:(N*=N,u=N*N*this._dot4(r[ge],S,b,R,L));let X=.6-dt*dt-U*U-at*at-ze*ze;X<0?h=0:(X*=X,h=X*X*this._dot4(r[re],dt,U,at,ze));let I=.6-Y*Y-ue*ue-ke*ke-fe*fe;I<0?d=0:(I*=I,d=I*I*this._dot4(r[ve],Y,ue,ke,fe));let j=.6-Ie*Ie-$e*$e-Ze*Ze-D*D;j<0?f=0:(j*=j,f=j*j*this._dot4(r[Ue],Ie,$e,Ze,D));let ie=.6-v*v-O*O-J*J-ee*ee;return ie<0?g=0:(ie*=ie,g=ie*ie*this._dot4(r[Te],v,O,J,ee)),27*(u+h+d+f+g)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,s){return e[0]*t+e[1]*n+e[2]*s}_dot4(e,t,n,s,r){return e[0]*t+e[1]*n+e[2]*s+e[3]*r}};var uo=class i extends On{constructor(e,t,n=512,s=512,r,a,o){super(),this.width=n,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Bm(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Vt(this.width,this.height,{type:Ut}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new St({defines:Object.assign({},oo.defines),uniforms:hn.clone(oo.uniforms),vertexShader:oo.vertexShader,fragmentShader:oo.fragmentShader,blending:Ot,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Fa,this.normalMaterial.blending=Ot,this.pdMaterial=new St({defines:Object.assign({},co.defines),uniforms:hn.clone(co.uniforms),vertexShader:co.vertexShader,fragmentShader:co.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new St({defines:Object.assign({},lo.defines),uniforms:hn.clone(lo.uniforms),vertexShader:lo.vertexShader,fragmentShader:lo.fragmentShader,blending:Ot}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new St({uniforms:hn.clone(Gr.uniforms),vertexShader:Gr.vertexShader,fragmentShader:Gr.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:$a,blendDst:zs,blendEquation:In,blendSrcAlpha:Ya,blendDstAlpha:zs,blendEquationAlpha:In}),this.blendMaterial=new St({uniforms:hn.clone(Gc.uniforms),vertexShader:Gc.vertexShader,fragmentShader:Gc.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Al,blendSrc:$a,blendDst:zs,blendEquation:In,blendSrcAlpha:Ya,blendDstAlpha:zs,blendEquationAlpha:In}),this._fsQuad=new ls(null),this._originalClearColor=new De,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Ps,this.depthTexture.format=ss,this.depthTexture.type=is,this.normalRenderTarget=new Vt(this.width,this.height,{minFilter:Ft,magFilter:Ft,type:Ut,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let n=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Td(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case i.OUTPUT.Off:break;case i.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Ot,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Ot,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Ot,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Ot,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Ot,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,n,s,r){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,s,r){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s=t.clearColor||s,r=t.clearAlpha||r,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){(n.isPoints||n.isLine||n.isLine2)&&n.visible&&(n.visible=!1,t.push(n))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Wc,n=e*e*4,s=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){let l=a,c=o;s[(a*e+o)*4]=(t.noise(l,c)*.5+.5)*255,s[(a*e+o)*4+1]=(t.noise(l+e,c)*.5+.5)*255,s[(a*e+o)*4+2]=(t.noise(l,c+e)*.5+.5)*255,s[(a*e+o)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let r=new ci(s,e,e,_n,Nn);return r.wrapS=kt,r.wrapT=kt,r.needsUpdate=!0,r}};uo.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var ho={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
    precision highp float;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,fragmentShader:`

    precision highp float;

    uniform sampler2D tDiffuse;

    #include <tonemapping_pars_fragment>
    #include <colorspace_pars_fragment>

    varying vec2 vUv;

    void main() {

      gl_FragColor = texture2D( tDiffuse, vUv );

      // tone mapping

      #ifdef LINEAR_TONE_MAPPING

        gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

      #elif defined( REINHARD_TONE_MAPPING )

        gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

      #elif defined( CINEON_TONE_MAPPING )

        gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

      #elif defined( ACES_FILMIC_TONE_MAPPING )

        gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

      #elif defined( AGX_TONE_MAPPING )

        gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

      #elif defined( NEUTRAL_TONE_MAPPING )

        gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

      #elif defined( CUSTOM_TONE_MAPPING )

        gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

      #endif

      // color space

      #ifdef SRGB_TRANSFER

        gl_FragColor = sRGBTransferOETF( gl_FragColor );

      #endif

    }`};var jc=class extends On{constructor(){super(),this.uniforms=hn.clone(ho.uniforms),this.material=new Na({name:ho.name,uniforms:this.uniforms,vertexShader:ho.vertexShader,fragmentShader:ho.fragmentShader}),this._fsQuad=new ls(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Je.getTransfer(this._outputColorSpace)===ht&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Nl?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Fl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Ol?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Dr?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Bl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===kl?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===zl&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var fo={elevation:38,azimuth:-35,sunlight:1.85,exposure:1.02,reflection:.9,ambient:.26,haze:.08,occlusion:.75,wetness:.62},Ad={elevation:[12,85],azimuth:[-180,180],sunlight:[0,5],exposure:[.45,1.6],reflection:[0,1.8],ambient:[.1,1.5],haze:[0,.3],occlusion:[0,1.4],wetness:[0,1]},po={day:{...fo},golden:{...fo,elevation:25,azimuth:-70,sunlight:3.1,exposure:.94,reflection:.85,ambient:.34,haze:.07},soft:{...fo,elevation:65,azimuth:20,sunlight:1.25,ambient:.8,reflection:.9,exposure:1.04,haze:.035}};function qc(i={}){return Object.fromEntries(Object.entries(fo).map(([e,t])=>{let[n,s]=Ad[e],r=i?.[e];return[e,Number.isFinite(r)?Math.min(s,Math.max(n,r)):t]}))}function km(i){let e=(t,n)=>{let s=1,r=0;for(;t>0;)s/=n,r+=s*(t%n),t=Math.floor(t/n);return r};return[e(i+1,2)-.5,e(i+1,3)-.5]}function Hm({visuals:i,exportImage:e,invalidate:t}){let n=document.createElement("section");n.className="render-studio panel",n.hidden=!0,n.setAttribute("aria-label","\u5149\u5F71\u6E32\u67D3\u8BBE\u7F6E"),n.innerHTML='<div class="studio-heading"><div><small>LIGHT & SURFACE</small><h2>\u5149\u5F71\u5DE5\u4F5C\u53F0</h2></div><button id="close-render-studio" class="icon-button" aria-label="\u5173\u95ED\u5149\u5F71\u5DE5\u4F5C\u53F0">\xD7</button></div><p class="studio-note">\u8C03\u6574\u5149\u7EBF\u4E0E\u53CD\u5149\uFF0C\u9884\u89C8\u5F53\u524D\u5EFA\u7B51\u3002</p><div class="light-presets"><button data-light-preset="day">\u6674\u65E5</button><button data-light-preset="golden">\u6696\u9633</button><button data-light-preset="soft">\u67D4\u5149</button></div><div id="render-sliders"></div><label class="check"><input id="studio-compare" type="checkbox">\u5BF9\u6BD4\u57FA\u7840\u5149\u7167</label><div class="studio-actions"><button id="reset-light">\u6062\u590D\u5149\u5F71</button><button id="studio-export">\u6E32\u67D3 4K \u539F\u56FE</button></div><p class="studio-note">4K \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 PNG<br>\u9759\u5E27\u6E32\u67D3\u671F\u95F4\u4F1A\u6682\u65F6\u9501\u5B9A\u89C6\u89D2\u3002</p>',document.body.append(n);let s=d=>n.querySelector(d),r=document.querySelector("#open-render-studio");sn(s("#close-render-studio"),"close","");let a;try{a=JSON.parse(localStorage.getItem("campus-render-settings"))}catch{}let o=qc(a),l=!1,c={elevation:"\u592A\u9633\u9AD8\u5EA6",azimuth:"\u5149\u7167\u65B9\u5411",sunlight:"\u9633\u5149\u5F3A\u5EA6",exposure:"\u753B\u9762\u66DD\u5149",reflection:"\u73AF\u5883\u53CD\u5149",ambient:"\u6697\u90E8\u8865\u5149",haze:"\u7A7A\u6C14\u900F\u89C6",occlusion:"\u63A5\u89E6\u9634\u5F71",wetness:"\u5730\u8868\u6E7F\u6DA6\u5EA6"};for(let[d,f]of Object.entries(c)){let g=document.createElement("label");g.className="render-slider";let _=document.createElement("span"),m=document.createElement("output"),p=document.createElement("input");_.textContent=f,p.type="range",p.min=Ad[d][0],p.max=Ad[d][1],p.step=d==="azimuth"||d==="elevation"?1:.01,p.dataset.renderSetting=d,p.setAttribute("aria-label",f),p.oninput=()=>{o[d]=Number(p.value),l=!1,s("#studio-compare").checked=!1,u(!1)},p.onchange=()=>u(!0),g.append(_,m,p),s("#render-sliders").append(g)}function u(d=!0){for(let f of n.querySelectorAll("[data-render-setting]")){let g=f.dataset.renderSetting;f.value=o[g],f.previousElementSibling.value=g==="azimuth"||g==="elevation"?o[g]+"\xB0":o[g].toFixed(2)}i.configure(l?{...o,reflection:0,occlusion:0}:o,{rebuild:d});try{localStorage.setItem("campus-render-settings",JSON.stringify(o))}catch{}t()}let h=d=>{n.hidden=!d,r.setAttribute("aria-expanded",String(d)),t()};return r.onclick=()=>h(n.hidden),s("#close-render-studio").onclick=()=>h(!1),n.querySelectorAll("[data-light-preset]").forEach(d=>d.onclick=()=>{o={...po[d.dataset.lightPreset]},l=!1,s("#studio-compare").checked=!1,document.querySelector("#daylight").value=d.dataset.lightPreset==="golden"?"golden":"day",u()}),s("#studio-compare").onchange=()=>{l=s("#studio-compare").checked,u(!1)},s("#reset-light").onclick=()=>{o={...fo},l=!1,s("#studio-compare").checked=!1,u()},s("#studio-export").onclick=e,document.querySelector("#daylight").addEventListener("change",d=>{o={...po[d.target.value]},l=!1,u()}),u(),{panel:n,get settings(){return{...o}},setOpen:h}}function Vm({renderer:i,scene:e,camera:t}){let n=null,s=[],r=0,a=0,o=!0;function l(){for(let{mirror:h}of s)e.remove(h),h.geometry.dispose(),h.dispose();s=[]}function c(h){n!==h&&(l(),n=h,n&&(n.updateMatrixWorld(!0),n.traverse(d=>{if(!d.isMesh||d.material?.userData.visualFinish!=="water")return;let f=d.geometry.clone().applyMatrix4(d.matrixWorld);f.computeBoundingBox();let g=f.boundingBox,_=g.getSize(new C);if(_.y>.2||_.x*_.z<600){f.dispose();return}let m=(g.min.y+g.max.y)/2;f.translate(0,-m,0).rotateX(Math.PI/2);let p={...en.ReflectorShader,uniforms:{...en.ReflectorShader.uniforms,strength:{value:.5},settledDetail:{value:1}},vertexShader:en.ReflectorShader.vertexShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vWaterWorld;").replace("vUv = textureMatrix",`vWaterWorld=(modelMatrix*vec4(position,1.)).xyz;
 vUv = textureMatrix`),fragmentShader:en.ReflectorShader.fragmentShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vWaterWorld; uniform float strength; uniform float settledDetail;").replace("vec4 base = texture2DProj( tDiffuse, vUv );",`
            float waterDetail=1.-smoothstep(.3,1.5,length(fwidth(vWaterWorld.xz)));
            vec2 ripple=vec2(sin(vWaterWorld.x*2.3+vWaterWorld.z*1.1),cos(vWaterWorld.z*5.4-vWaterWorld.x*1.8));
            ripple+=.35*vec2(cos(vWaterWorld.z*6.1),sin(vWaterWorld.x*8.+vWaterWorld.z*2.2));
            vec2 coord=clamp(vUv.xy/vUv.w+ripple*.0007*waterDetail,vec2(.002),vec2(.998));
            vec4 base=texture2D(tDiffuse,coord);
            // A small directional blur breaks the perfect mirror. During a
            // gesture a single cached lookup is sufficient; no new scene pass.
            if(settledDetail>.5){
              vec2 spread=vec2(.0004,.0008)*(1.+.4*ripple.x);
              base=base*.5+.125*(texture2D(tDiffuse,coord+spread)+texture2D(tDiffuse,coord-spread)
                +texture2D(tDiffuse,coord+vec2(spread.x,-spread.y))+texture2D(tDiffuse,coord+vec2(-spread.x,spread.y)));
            }`).replace("gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );","float f0=pow((1.333-1.)/(1.333+1.),2.); float fresnel=f0+(1.-f0)*pow(1.-abs(normalize(cameraPosition-vWaterWorld).y),5.); gl_FragColor=vec4(base.rgb*color,clamp(strength*fresnel*.8,0.,.8));")},M=new en(f,{textureWidth:1024,textureHeight:1024,color:14741227,clipBias:5e-4,multisample:4,shader:p});M.name="Cached shoreline reflection",M.rotation.x=-Math.PI/2,M.position.y=m+.035,M.material.transparent=!0,M.material.depthWrite=!1,M.renderOrder=2;let x={source:d,mirror:M,captured:!1},y=M.onBeforeRender,w=new Ce,T=new Ce,P=-1;M.onBeforeRender=(A,S,b)=>{if(S.overrideMaterial||b!==t||!o||P===r&&w.equals(t.matrixWorld)&&T.equals(t.projectionMatrix))return;let R=[];e.traverse(L=>{L!==M&&(L.isReflector||L.isLine||L.isLineSegments)&&L.visible&&(R.push(L),L.visible=!1)});try{y.call(M,A,S,b),a++,x.captured=!0,w.copy(t.matrixWorld),T.copy(t.projectionMatrix),P=r}finally{R.forEach(L=>L.visible=!0)}},e.add(M),s.push(x)})))}function u({moving:h,quality:d,strength:f}){o=!h;for(let{source:g,mirror:_,captured:m}of s){let p=!0;for(let M=g;M;M=M.parent)M.visible||(p=!1);_.visible=p&&(!h||m)&&d!=="balanced"&&f>0,_.material.uniforms.strength.value=f,_.material.uniforms.settledDetail.value=h?0:1}}return{attach:c,prepare:u,invalidate:()=>r++,get diagnostics(){return{surfaces:s.length,updates:a,mode:"cached planar shoreline",retainDuringMotion:!0}}}}function Gm(i){let e=i.index?i.toNonIndexed():i.clone(),t=e.getAttribute("position"),n=new Map,s=[],r=o=>o.toArray().map(l=>Math.round(l*1e4)).join(",");for(let o=0;o<t.count;o+=3){let l=[0,1,2].map(d=>new C().fromBufferAttribute(t,o+d)),c=new C().crossVectors(l[1].clone().sub(l[0]),l[2].clone().sub(l[0])),u=c.length();c.normalize();let h={index:o,normal:c,area:u,edges:[]};s.push(h);for(let d=0;d<3;d++){let f=l[(d+1)%3],g=l[(d+2)%3],_=[r(f),r(g)].sort().join("|");n.has(_)||n.set(_,[]),n.get(_).push(h),h.edges.push({id:_,height:u/Math.max(f.distanceTo(g),1e-8)})}}let a=new Float32Array(t.count*3);for(let o of s)for(let l=0;l<3;l++){let{id:c,height:u}=o.edges[l],h=n.get(c),d=h.length===1||h.some(f=>o.normal.dot(f.normal)<.995);for(let f=0;f<3;f++)a[(o.index+f)*3+l]=d?f===l?u:0:1e5}return e.setAttribute("campusEdgeDistance",new ct(a,3)),e}function fb(i){if(!i)return[];i.updateMatrixWorld(!0);let e=[];return i.traverse(t=>{if(!t.isMesh||t.material?.userData.visualFinish!=="glass")return;let n=t.geometry,s=n.attributes.position,r=n.index?.count??s.count,a=new Map;for(let o=0;o<r;o+=3){let l=[0,1,2].map(g=>new C().fromBufferAttribute(s,n.index?n.index.getX(o+g):o+g).applyMatrix4(t.matrixWorld)),c=new C().crossVectors(l[1].clone().sub(l[0]),l[2].clone().sub(l[0])),u=c.length()/2;if(u<.001||(c.normalize(),Math.abs(c.y)>.1))continue;let h=c.dot(l[0]),d=[...c.toArray().map(g=>Math.round(g*1e3)),Math.round(h*20)].join(",");a.has(d)||a.set(d,{source:t,normal:c,distance:h,area:0,vertices:[],center:new C});let f=a.get(d);f.area+=u;for(let g of l)f.vertices.push(...g.toArray()),f.center.addScaledVector(g,u/3)}for(let o of a.values())if(o.area>=25){o.center.divideScalar(o.area),o.bounds=new Gt;for(let l=0;l<o.vertices.length;l+=3)o.bounds.expandByPoint(new C().fromArray(o.vertices,l));e.push(o)}}),e}var Wm=i=>{if(i.material?.userData.visualFinish!=="glass")return!1;for(let e=i;e;e=e.parent)if(!e.visible)return!1;return!0};function jm({scene:i,camera:e}){let t=null,n=[],s=null,r=null,a=!1,o=!0,l=0,c=-1,u=0,h=new Ce,d=new Ce,f=new ts,g=new Ce;function _(){r&&(i.remove(r),r.geometry.dispose(),r.dispose()),r=null,s=null,a=!1,c=-1}function m(x){t!==x&&(_(),t=x,n=fb(t))}function p(x){if(x===s||(_(),!x))return;s=x;let y=new Kt().setFromUnitVectors(new C(0,0,1),x.normal),w=y.clone().invert(),T=x.normal.clone().multiplyScalar(x.distance),P=new gt,A=new Float32Array(x.vertices.length);for(let R=0;R<A.length;R+=3)new C().fromArray(x.vertices,R).sub(T).applyQuaternion(w).toArray(A,R);P.setAttribute("position",new ct(A,3)),P.computeVertexNormals();let S={...en.ReflectorShader,uniforms:{...en.ReflectorShader.uniforms,strength:{value:.8},facadeNormal:{value:x.normal.clone()}},vertexShader:en.ReflectorShader.vertexShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vGlassWorld;").replace("vUv = textureMatrix","vGlassWorld=(modelMatrix*vec4(position,1.)).xyz; vUv = textureMatrix"),fragmentShader:en.ReflectorShader.fragmentShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vGlassWorld; uniform vec3 facadeNormal; uniform float strength;").replace("vec4 base = texture2DProj( tDiffuse, vUv );","vec4 glassUv=vUv; glassUv.xy+=vec2(sin(vGlassWorld.y*.6),cos(dot(vGlassWorld.xz,vec2(.3,.5))))*.0002*vUv.w; vec2 uv=glassUv.xy/glassUv.w; vec2 blur=vec2(.0013); vec4 base=.4*texture2D(tDiffuse,uv)+.15*(texture2D(tDiffuse,uv+blur)+texture2D(tDiffuse,uv-blur)+texture2D(tDiffuse,uv+vec2(blur.x,-blur.y))+texture2D(tDiffuse,uv+vec2(-blur.x,blur.y)));").replace("gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );","float facing=abs(dot(normalize(cameraPosition-vGlassWorld),facadeNormal)); float f0=pow((1.52-1.)/(1.52+1.),2.); float fresnel=f0+(1.-f0)*pow(1.-facing,5.); gl_FragColor=vec4(base.rgb*color,clamp(strength*fresnel*.65,0.,.65));")};r=new en(P,{textureWidth:768,textureHeight:768,color:14018024,clipBias:3e-4,multisample:4,shader:S}),r.name="Cached existing glass facade reflection",r.quaternion.copy(y),r.position.copy(T).addScaledVector(x.normal,.012),r.material.transparent=!0,r.material.depthWrite=!1,r.renderOrder=3;let b=r.onBeforeRender;r.onBeforeRender=(R,L,F)=>{if(!o||F!==e||L.overrideMaterial||c===l&&h.equals(e.matrixWorld)&&d.equals(e.projectionMatrix))return;let z=[];i.traverse(V=>{V!==r&&(V.isReflector||V.isLine||V.isLineSegments)&&V.visible&&(z.push(V),V.visible=!1)});try{b.call(r,R,L,F),a=!0,u++,h.copy(e.matrixWorld),d.copy(e.projectionMatrix),c=l}finally{z.forEach(V=>V.visible=!0)}},i.add(r)}function M({moving:x,quality:y,strength:w}){if(o=!x,!x){let T=null,P=0;if(e.updateMatrixWorld(!0),f.setFromProjectionMatrix(g.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse)),y!=="balanced"&&w>0)for(let A of n){if(!Wm(A.source)||!f.intersectsBox(A.bounds))continue;let S=e.position.clone().sub(A.center),b=S.length();if(b>260||S.dot(A.normal)<1)continue;let R=A.area*S.normalize().dot(A.normal)/Math.max(64,b*b)*(A===s?1.2:1);R>P&&(T=A,P=R)}p(T)}r&&(r.visible=Wm(s.source)&&y!=="balanced"&&w>0&&(!x||a),r.material.uniforms.strength.value=w)}return{attach:m,prepare:M,invalidate:()=>l++,get diagnostics(){return{availablePlanes:n.length,activePlanes:r?.visible?1:0,activeMaterial:r?.visible?s.source.material.name:null,maximumActivePlanes:1,updates:u,retainDuringMotion:!0,frustumCulled:!0,resolution:768}}}}var qm=`
#ifdef CAMPUS_INTERIOR
varying vec4 vCampusInterior;
vec3 campusGlazingDepth(vec3 surfaceNormal){
  vec3 n=normalize(surfaceNormal);
  vec3 u=normalize(vec3(n.z,0.,-n.x)+vec3(.00001,0.,0.));
  vec3 v=vec3(0.,1.,0.);
  #ifdef CAMPUS_SKYLIGHT
    u=vec3(1.,0.,0.);v=vec3(0.,0.,-1.);n=vec3(0.,1.,0.);
  #endif
  vec3 ray=normalize(vCampusWorld-cameraPosition);
  vec3 rd=vec3(dot(ray,u),dot(ray,v),max(.035,-dot(ray,n)));
  vec2 size=max(vCampusInterior.zw,vec2(.1));
  vec2 origin=clamp(mod(vCampusInterior.xy,size),vec2(.001),size-.001);
  float depth=5.2;
  #ifdef CAMPUS_SKYLIGHT
    depth=4.6;
  #endif
  vec2 side=mix(vec2(0.),size,step(vec2(0.),rd.xy));
  vec2 signedSafe=mix(vec2(-1.),vec2(1.),step(vec2(0.),rd.xy))*max(abs(rd.xy),vec2(.0001));
  vec2 wallT=(side-origin)/signedSafe;
  float backT=depth/rd.z;
  float t=min(backT,min(wallT.x,wallT.y));
  vec3 hit=vec3(origin,0.)+rd*t;
  float ceiling=step(wallT.y,min(wallT.x,backT))*step(0.,rd.y);
  float floorHit=step(wallT.y,min(wallT.x,backT))*(1.-step(0.,rd.y));
  vec3 tint=mix(vec3(.115,.132,.133),vec3(.22,.225,.213),ceiling);
  tint=mix(tint,vec3(.105,.117,.115),floorHit);
  float daylight=.52+.64*exp(-hit.z*.34);
  float corner=min(min(hit.x,size.x-hit.x),min(hit.y,size.y-hit.y));
  float contact=mix(.55,1.,smoothstep(0.,.3,max(corner,0.)));
  // Soft wall / floor joins, not decorative furniture pasted into every pane.
  float floorSeam=campusJoint(hit.xz,vec2(1.2,.6),.008)*floorHit;
  tint*=daylight*contact*(1.-floorSeam*.15);
  float paneId=campusHash(vec3(floor(vCampusInterior.xy/size),8.));
  tint*=mix(.86,1.12,paneId);
  #ifndef CAMPUS_SKYLIGHT
    // Existing storey spacing: a thin slab edge visible through the curtain wall.
    float slab=(1.-smoothstep(.06,.15,origin.y))*smoothstep(.003,.015,origin.y);
    tint=mix(tint,vec3(.19,.205,.201),slab*.8);
  #else
    // A circular shaft uses the registered opening; depth is only an estimate.
    vec2 centre=size*.5;float radius=min(size.x,size.y)*.5;
    float rim=smoothstep(radius-.6,radius,length(origin-centre));
    tint=mix(tint,vec3(.065,.089,.091),rim*.7);
  #endif
  return tint*vec3(.79,.94,.97);
}
#endif
`;var Xm={"/campus-map/viewer/style.css":"/campus-map/viewer/assets/8028d873e30db1dfb6d6-style.css","/campus-map/viewer/map-ui.css":"/campus-map/viewer/assets/1739162669791634595b-map-ui.css","/campus-map/exports/campus-lod0.glb":"/campus-map/viewer/assets/f27109b8da2a97ca8bff-campus-lod0.glb","/campus-map/exports/campus-lod1.glb":"/campus-map/viewer/assets/9ef76a7349602f01aa20-campus-lod1.glb","/campus-map/exports/campus-lod2.glb":"/campus-map/viewer/assets/2f2c942444553e9a5f8e-campus-lod2.glb","/campus-map/data/materials/white_plaster_02-Diffuse.jpg":"/campus-map/viewer/assets/a1ebbe091bd1ae93d2ab-white_plaster_02-Diffuse.jpg","/campus-map/data/materials/mobile/white_plaster_02-Diffuse.webp":"/campus-map/viewer/assets/2681b3b24566842da7e0-white_plaster_02-Diffuse.webp","/campus-map/data/materials/white_plaster_02-nor_gl.jpg":"/campus-map/viewer/assets/eb572ca3630d5bfde72e-white_plaster_02-nor_gl.jpg","/campus-map/data/materials/mobile/white_plaster_02-nor_gl.webp":"/campus-map/viewer/assets/5374ddae24bfff937498-white_plaster_02-nor_gl.webp","/campus-map/data/materials/white_plaster_02-Rough.jpg":"/campus-map/viewer/assets/4ff1fe957cd161b07f72-white_plaster_02-Rough.jpg","/campus-map/data/materials/mobile/white_plaster_02-Rough.webp":"/campus-map/viewer/assets/64c8cb56a19682b5b0bf-white_plaster_02-Rough.webp","/campus-map/data/materials/asphalt_02-Diffuse.jpg":"/campus-map/viewer/assets/1aa5ce99f58a625c71d4-asphalt_02-Diffuse.jpg","/campus-map/data/materials/mobile/asphalt_02-Diffuse.webp":"/campus-map/viewer/assets/054f3b0c2956cbf0afe7-asphalt_02-Diffuse.webp","/campus-map/data/materials/asphalt_02-nor_gl.jpg":"/campus-map/viewer/assets/42a1c381b53204e83a98-asphalt_02-nor_gl.jpg","/campus-map/data/materials/mobile/asphalt_02-nor_gl.webp":"/campus-map/viewer/assets/953c037fa03f2017795f-asphalt_02-nor_gl.webp","/campus-map/data/materials/asphalt_02-Rough.jpg":"/campus-map/viewer/assets/70ba3edc65525eb4dc36-asphalt_02-Rough.jpg","/campus-map/data/materials/mobile/asphalt_02-Rough.webp":"/campus-map/viewer/assets/9bbed335ea3aa7dd715f-asphalt_02-Rough.webp","/campus-map/data/materials/grass_ground-Diffuse.jpg":"/campus-map/viewer/assets/a79cc5ed65af0f80261b-grass_ground-Diffuse.jpg","/campus-map/data/materials/mobile/grass_ground-Diffuse.webp":"/campus-map/viewer/assets/8291a7404bfb2dbe86f1-grass_ground-Diffuse.webp","/campus-map/data/materials/grass_ground-nor_gl.jpg":"/campus-map/viewer/assets/7000e2ccd479bb7b66dc-grass_ground-nor_gl.jpg","/campus-map/data/materials/mobile/grass_ground-nor_gl.webp":"/campus-map/viewer/assets/16b9b4ae5e0f7293e8f2-grass_ground-nor_gl.webp","/campus-map/data/materials/grass_ground-Rough.jpg":"/campus-map/viewer/assets/111341f948b7e073edf7-grass_ground-Rough.jpg","/campus-map/data/materials/mobile/grass_ground-Rough.webp":"/campus-map/viewer/assets/787e5be80e6b0722b850-grass_ground-Rough.webp","/campus-map/data/materials/overcast_soil_puresky_1k.hdr":"/campus-map/viewer/assets/2dbbbbb1323a8e8989db-overcast_soil_puresky_1k.hdr","/campus-map/data/materials/mobile/overcast_soil_puresky_256.hdr":"/campus-map/viewer/assets/ce0ef3b6f5ad92533c80-overcast_soil_puresky_256.hdr","/campus-map/data/materials/mobile/finishes.bin":"/campus-map/viewer/assets/711d8f37233064806f2f-finishes.bin"};function mb(i){let e=typeof location>"u"?null:new URLSearchParams(location.search).get("startupProbe");return e&&/^[a-z0-9-]{1,40}$/.test(e)?i+"?startupProbe="+e:i}function cs(i){return mb(Xm[i]||i)}function Ym(i){let e=new DataView(i).getUint32(0,!0);if(e>8192||e+4>i.byteLength)throw Error("Invalid texture pack");let t=JSON.parse(new TextDecoder().decode(new Uint8Array(i,4,e))),n={};for(let{name:s,offset:r,length:a}of t){if(!Number.isInteger(r)||!Number.isInteger(a)||r<0||a<1||4+e+r+a>i.byteLength)throw Error("Invalid texture entry");n[s]=new Uint8Array(i,4+e+r,a)}return n}var $m={version:"BNBU-PBR-20261016",rules:"Photo evidence selects materials; material examples are not surveyed construction specifications. Preserve existing geometry, source UVs and source textures. Red brick, roof tile and foliage are library reserves until their exact locations are confirmed.",materials:[{id:"BNBU_01_White_Plaster",label:"\u767D\u8272\u6D82\u5C42\u5916\u5899",color:"#d9dbd4",roughness:.75,metalness:0,asset:"white_plaster_02",repeat_m:1,assignment:"Photo-observed pale walls and trims; restrained scan microstructure"},{id:"BNBU_02_Red_Brick",label:"\u7EA2\u7816\uFF08\u5F85\u5B9A\u4F4D\uFF09",color:"#9e5542",roughness:.85,metalness:0,assignment:"Reserve only; never replace ochre teaching ceramic with red brick"},{id:"BNBU_03_Facade_Glass",label:"\u5EFA\u7B51\u73BB\u7483",color:"#a4bec2",roughness:.11,metalness:0,ior:1.52,transmission:1,assignment:"Existing glazing only; Blender transmission, runtime analytic depth and cached reflection"},{id:"BNBU_04_Concrete",label:"\u6DF7\u51DD\u571F",color:"#b7b9b2",roughness:.85,metalness:0,assignment:"Uncoated structural concrete; procedural microfinish"},{id:"BNBU_05_Asphalt",label:"\u6CA5\u9752",color:"#505b60",roughness:.9,metalness:0,asset:"asphalt_02",repeat_m:3,assignment:"Existing campus asphalt surfaces"},{id:"BNBU_06_Paving_Stone",label:"\u77F3\u6750\u94FA\u88C5",color:"#c4bb9e",roughness:.7,metalness:0,assignment:"Existing paving; metre-scale joints and microfinish"},{id:"BNBU_07_Grass",label:"\u8349\u576A",color:"#59784b",roughness:.9,metalness:0,asset:"grass_ground",repeat_m:2.51,assignment:"Existing planted surfaces; generic scan tinted to photo palette"},{id:"BNBU_08_Foliage",label:"\u6811\u53F6\uFF08\u6750\u8D28\u9884\u7559\uFF09",color:"#426c35",roughness:.9,metalness:0,assignment:"Reserve for evidenced vegetation geometry"},{id:"BNBU_09_Metal",label:"\u91D1\u5C5E\u7A97\u6846",color:"#536b72",roughness:.3,metalness:1,assignment:"Existing metal mullions, rails and roof perimeter frames"},{id:"BNBU_10_Rubber_Track",label:"\u6A61\u80F6\u8FD0\u52A8\u573A",color:"#a36556",roughness:.85,metalness:0,assignment:"Existing sport surface polygons; preserve original track markings"},{id:"BNBU_11_Roof_Tile",label:"\u5C4B\u9876\u74E6\uFF08\u5F85\u5B9A\u4F4D\uFF09",color:"#8b6554",roughness:.7,metalness:0,assignment:"Reserve only; existing flat roofs stay membrane surfaces"},{id:"BNBU_12_Water",label:"\u6E56\u9762",color:"#365d50",roughness:.18,metalness:0,ior:1.333,transmission:.9,assignment:"Existing shoreline; filtered ripple normals and cached reflections"},{id:"BNBU_13_Ochre_Ceramic",label:"\u6696\u8272\u9676\u7816",color:"#c4a16a",roughness:.72,metalness:0,assignment:"Teaching ochre facade; estimated 0.12 x 0.24 m joints"},{id:"BNBU_14_Roof_Membrane",label:"\u5E73\u5C4B\u9762",color:"#8e9693",roughness:.82,metalness:0,assignment:"Existing flat roof areas; subdued seams and raised existing edges"},{id:"BNBU_15_PV",label:"\u5149\u4F0F\u9762\u677F",color:"#13212d",roughness:.29,metalness:0,assignment:"Registered PV coverage only; no additional panel zones"}]};var _b={white_plaster_02:{scale:1,normal:.18,albedo:.32,mean:[.2692,.2435,.196]},asphalt_02:{scale:3,normal:.45,albedo:.7,mean:[.1033,.1018,.0899]},grass_ground:{scale:2.51,normal:.38,albedo:.7,mean:[.1555,.1178,.048]}};async function Zm(i,{mobile:e=!1}={}){let t=new Us,n={},s=Math.min(8,i.capabilities.getMaxAnisotropy()),r=null;if(e)try{let a=await fetch(cs("/campus-map/data/materials/mobile/finishes.bin"));if(!a.ok)throw Error("Texture pack unavailable");r=Ym(await a.arrayBuffer())}catch{}return await Promise.all(Object.entries(_b).map(async([a,o])=>{try{let l=await Promise.all(["Diffuse","nor_gl","Rough"].map(async c=>{let u=r?.[`${a}-${c}.webp`],h=u?URL.createObjectURL(new Blob([u],{type:"image/webp"})):null,d;try{d=await t.loadAsync(h||cs(e?`/campus-map/data/materials/mobile/${a}-${c}.webp`:`/campus-map/data/materials/${a}-${c}.jpg`))}finally{h&&URL.revokeObjectURL(h)}return d.wrapS=d.wrapT=kt,d.anisotropy=s,d.colorSpace=c==="Diffuse"?Rt:Fn,[c,d]}));n[a]={...o,...Object.fromEntries(l)}}catch{console.warn("\u8868\u9762\u8D34\u56FE\u672A\u8F7D\u5165\uFF0C\u4FDD\u7559\u7A0B\u5E8F\u6750\u8D28\uFF1A"+a)}})),n}function Km(i,e){if(i==="marker"||i==="datum")return null;let n={glass:3,metal:9,water:12,solar:15,ceramic:13,roof:14,sport:10,asphalt:5,paving:6,grass:7}[i]||(/white|pale|paint|plaster|fascia/i.test(e)?1:4);return $m.materials[n-1]}function Rd(i,e,t){return i==="asphalt"?t.asphalt_02:i==="paving"&&t.white_plaster_02?{...t.white_plaster_02,scale:.8,normal:.22,albedo:.38}:i==="grass"?t.grass_ground:i==="stone"&&/white|pale|paint|plaster|fascia|Approximate/i.test(e)?t.white_plaster_02:null}var Cd={value:.62},us={balanced:{label:"\u6D41\u7545",pixels:2560*1440,dpr:1.5,shadow:2048,ao:!1},high:{label:"\u7CBE\u7EC6",pixels:3200*1800,dpr:2,shadow:4096,ao:!0},ultra:{label:"\u6781\u81F4",pixels:3840*2160,dpr:2.5,shadow:4096,ao:!0}};function Qm(i,e,t,n,s=!1){let r=us[i]||us.high;return Math.min(n,r.dpr,s?1:1/0,Math.sqrt(r.pixels/Math.max(1,e*t)))}function yb(i){let e=i.toLowerCase();return/water surface/.test(e)?"water":e==="photo-estimated teaching facade ochre"?"ceramic":/unknown|construction|marker/.test(e)?"marker":/frame|mullion|rail|fence|lattice|border|roof equipment/.test(e)?/mullion|rail|fence|lattice|equipment/.test(e)?"metal":"stone":/\bpv\b/.test(e)?"solar":/glass|glazing|skylight|admin se bands|hall circular roof band/.test(e)?"glass":/asphalt|parking/.test(e)?"asphalt":/paving|terrace.*finish/.test(e)?"paving":/vegetat|planting|lawn/.test(e)?"grass":/datum/.test(e)?"datum":/\bsports?\b|\btrack\b|\bcourts?\b|\bmarkings?\b|\blines\b/.test(e)?"sport":/roof (edge|rim)|roof pale|roof green surround/.test(e)?"stone":/roof/.test(e)?"roof":/cladding/.test(e)&&!/seams/.test(e)?"cladding":"stone"}var xb=`
varying vec3 vCampusWorld;
varying vec3 vCampusNormal;
float campusHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float campusNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(campusHash(i),campusHash(i+vec3(1,0,0)),f.x),mix(campusHash(i+vec3(0,1,0)),campusHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(campusHash(i+vec3(0,0,1)),campusHash(i+vec3(1,0,1)),f.x),mix(campusHash(i+vec3(0,1,1)),campusHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
// Analytic filtering keeps joints and pane lines quiet during camera movement.
float campusJoint(vec2 uv,vec2 size,float width){
 vec2 cell=uv/size,edge=min(fract(cell),1.-fract(cell))*size;
 vec2 aa=max(fwidth(uv),vec2(.002));
 vec2 line=1.-smoothstep(vec2(width),vec2(width)+aa,edge);
 return max(line.x,line.y)*(1.-smoothstep(.3,1.,max(aa.x,aa.y)/min(size.x,size.y)));
}
`;function Jm(i,e,t){let n={stone:0,glass:1,metal:2,asphalt:3,paving:4,grass:5,water:6,datum:7,roof:8,marker:9,cladding:10,solar:11,sport:12,ceramic:13};i.onBeforeCompile=s=>{s.uniforms.campusWetness=Cd,Object.assign(s.uniforms,os),t&&(s.uniforms.campusAlbedoMap={value:t.Diffuse},s.uniforms.campusRoughMap={value:t.Rough},s.uniforms.campusScanNormal={value:t.nor_gl},s.uniforms.campusScanScale={value:t.scale},s.uniforms.campusScanStrength={value:new he(t.albedo,t.normal)},s.uniforms.campusScanMean={value:new C(...t.mean)});let r={stone:.42,cladding:.42,ceramic:.42,roof:.4,asphalt:.4,paving:.45,grass:.4,datum:.4,glass:.2,water:.2,metal:.45,solar:.3,marker:.5,sport:.3};s.uniforms.campusDiffuseIBL={value:r[e]},s.uniforms.campusSpecularIBL={value:i.envMapIntensity};let a=`
#ifdef CAMPUS_BEVEL
varying vec3 vCampusEdgeDistance;
#endif
#ifdef CAMPUS_PANE_UV
varying vec2 vCampusPaneUv;
#endif
`;s.vertexShader=`varying vec3 vCampusWorld;
varying vec3 vCampusNormal;
`+a+`
#ifdef CAMPUS_BEVEL
attribute vec3 campusEdgeDistance;
#endif
`+s.vertexShader,s.vertexShader=s.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vCampusWorld=(modelMatrix*vec4(transformed,1.)).xyz;
vCampusNormal=inverseTransformDirection(transformedNormal,viewMatrix);`),s.vertexShader=`
#ifdef CAMPUS_PANE_UV
attribute vec2 campusPaneUv;
#endif
`+s.vertexShader,s.vertexShader=s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
#ifdef CAMPUS_BEVEL
vCampusEdgeDistance=campusEdgeDistance;
#endif
#ifdef CAMPUS_PANE_UV
vCampusPaneUv=campusPaneUv;
#endif`),s.vertexShader=`
#ifdef CAMPUS_INTERIOR
attribute vec4 campusInterior;varying vec4 vCampusInterior;
#endif
`+s.vertexShader,s.vertexShader=s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
#ifdef CAMPUS_INTERIOR
vCampusInterior=campusInterior;
#endif`),s.fragmentShader=Fm+xb+a+`
uniform float campusWetness; uniform float campusDiffuseIBL;
uniform float campusSpecularIBL;
#define CAMPUS_SURFACE `+n[e]+`
`+s.fragmentShader,s.fragmentShader=`
#ifdef CAMPUS_SCAN
uniform sampler2D campusAlbedoMap,campusRoughMap,campusScanNormal;uniform float campusScanScale;uniform vec2 campusScanStrength;uniform vec3 campusScanMean;
#endif
`+s.fragmentShader,s.fragmentShader=s.fragmentShader.replace("void main() {",qm+`
void main() {`),s.fragmentShader=s.fragmentShader.replace("vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;",`
      vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
      #if CAMPUS_SURFACE == 3 || CAMPUS_SURFACE == 4 || CAMPUS_SURFACE == 7
        if(campusGroundAvailable>.001 && campusWet>.001){
          vec4 groundSample=campusGroundReflection(vCampusWorld,roughnessFactor);
          float facing=abs(dot(normalize(cameraPosition-vCampusWorld),normalize(vCampusNormal)));
          float fresnel=.025+.975*pow(1.-facing,5.);
          float coat=campusWet*fresnel*groundSample.a;
          // Attenuate the substrate; do not stack another opaque mirror over it.
          outgoingLight=outgoingLight*(1.-coat)+groundSample.rgb*coat;
        }
      #endif
      #ifdef CAMPUS_INTERIOR
        float glassFacing=abs(dot(normalize(cameraPosition-vCampusWorld),normalize(vCampusNormal)));
        float glassFresnel=.04+.96*pow(1.-glassFacing,5.);
        vec3 throughGlass=campusGlazingDepth(vCampusNormal);
        outgoingLight=throughGlass*(1.-glassFresnel)+totalSpecular;
      #endif
    `),s.fragmentShader=s.fragmentShader.replace("#include <normal_fragment_begin>",qe.normal_fragment_begin.replace("// non perturbed normal",`
      #ifdef CAMPUS_BEVEL
        float edgeDistance=min(vCampusEdgeDistance.x,min(vCampusEdgeDistance.y,vCampusEdgeDistance.z));
        vec3 faceN=normalize(cross(dFdx(-vViewPosition),dFdy(-vViewPosition)));
        normal=normalize(mix(faceN,normal,.7*(1.-smoothstep(0.,.08,edgeDistance))));
      #endif
      // non perturbed normal`)),s.fragmentShader=s.fragmentShader.replace("#include <envmap_physical_pars_fragment>",qe.envmap_physical_pars_fragment.replace("PI * envMapColor.rgb * envMapIntensity","PI * envMapColor.rgb * envMapIntensity * campusDiffuseIBL").replace("return envMapColor.rgb * envMapIntensity","return envMapColor.rgb * envMapIntensity * campusSpecularIBL")),s.fragmentShader=s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float campusGrain=campusNoise(vCampusWorld*13.);
      float campusMacro=campusNoise(vCampusWorld*.16);
      float campusDetail=(1.-smoothstep(160.,650.,length(vViewPosition)))*(1.-smoothstep(.12,.8,length(fwidth(vCampusWorld))));
      vec3 campusN=normalize(cross(dFdx(vCampusWorld),dFdy(vCampusWorld)));
      vec3 campusT=normalize(vec3(campusN.z,0.,-campusN.x)+vec3(.00001,0.,0.));
      vec2 campusUv=abs(campusN.y)>.65?vCampusWorld.xz:vec2(dot(vCampusWorld,campusT),vCampusWorld.y);
      float campusWet=campusWetness*smoothstep(.65,.95,abs(campusN.y))*(.55+.45*smoothstep(.18,.8,campusMacro));
      #if CAMPUS_SURFACE == 7
        campusWet*=step(-.05,vCampusWorld.y);
      #endif
      float campusHeight=0.;
      float campusSeam=0.;
      float campusPane=campusHash(vec3(floor(campusUv/vec2(1.4,3.2)),2.));
      #ifdef CAMPUS_PANE_UV
        campusPane=campusHash(vec3(floor(vCampusPaneUv+vec2(.0001)),2.));
      #endif
      #if CAMPUS_SURFACE == 0 || CAMPUS_SURFACE == 10
        float mineral=campusNoise(vCampusWorld*1.6);
        diffuseColor.rgb*=.91+.12*campusMacro+.045*(mineral-.5)+.075*(campusGrain-.5)*campusDetail;
        // Mild lower-wall weathering. No additional window or floor geometry.
        diffuseColor.rgb*=1.-.055*exp(-max(vCampusWorld.y,0.)*.25)*(1.-abs(campusN.y));
        campusHeight=(campusGrain-.5)*.003*campusDetail;
        #if CAMPUS_SURFACE == 10
          campusSeam=campusJoint(campusUv,vec2(1.2,.6),.008)*campusDetail;
          diffuseColor.rgb*=1.-campusSeam*.22;
          campusHeight-=campusSeam*.006;
        #endif
      #elif CAMPUS_SURFACE == 1
        #ifdef CAMPUS_PANE_UV
          campusSeam=campusJoint(vCampusPaneUv,vec2(1.),.009)*campusDetail;
          vec2 pane=fract(vCampusPaneUv);
          // Pane-aligned, restrained bowing.
          campusHeight=sin(pane.x*3.14159)*sin(pane.y*3.14159)*.003*campusDetail;
        #else
          campusHeight=sin(campusUv.x*.8)*cos(campusUv.y*.6)*.004*campusDetail;
        #endif
        diffuseColor.rgb*=mix(.78,1.12,campusPane)*(1.-campusSeam*.45);
      #elif CAMPUS_SURFACE == 3
        diffuseColor.rgb*=.85+.17*campusMacro+.17*campusGrain*campusDetail;
        campusHeight=(campusGrain-.5)*.005*campusDetail;
      #elif CAMPUS_SURFACE == 4
        campusSeam=campusJoint(campusUv,vec2(1.2,.6),.014)*campusDetail;
        float slab=campusHash(vec3(floor(campusUv/vec2(1.2,.6)),4.));
        float mineral=campusNoise(vCampusWorld*2.7);
        diffuseColor.rgb*=mix(.86+.15*campusMacro+.10*slab+.06*(mineral-.5),.62,campusSeam);
        campusHeight=(campusGrain-.5)*.002*campusDetail-campusSeam*.008;
      #elif CAMPUS_SURFACE == 5
        diffuseColor.rgb*=.78+.3*campusMacro+.09*campusGrain*campusDetail;
      #elif CAMPUS_SURFACE == 7
        // Neutral mineral substrate; no invented paving layout on unsurveyed land.
        float groundMottle=campusNoise(vCampusWorld*.65);
        diffuseColor.rgb*=.9+.08*campusMacro+.05*groundMottle+.025*(campusGrain-.5)*campusDetail;
        campusHeight=(campusGrain-.5)*.003*campusDetail;
      #elif CAMPUS_SURFACE == 8
        campusSeam=campusJoint(campusUv,vec2(4.,4.),.012)*campusDetail;
        float sheet=campusHash(vec3(floor(campusUv/vec2(4.)),5.));
        diffuseColor.rgb*=.88+.10*campusMacro+.055*sheet-campusSeam*.12;
        campusHeight=(campusGrain-.5)*.003*campusDetail-campusSeam*.003;
      #elif CAMPUS_SURFACE == 13
        // Small vertical ceramic units seen in the official teaching photos.
        // Unit dimensions and colour variation remain appearance estimates.
        float tileDetail=1.-smoothstep(.035,.16,max(fwidth(campusUv.x),fwidth(campusUv.y)));
        float tile=campusHash(vec3(floor(campusUv/vec2(.12,.24)),3.));
        campusSeam=campusJoint(campusUv,vec2(.12,.24),.002)*tileDetail;
        diffuseColor.rgb*=.95+.06*campusMacro+(.16*(tile-.5)-.18*campusSeam)*tileDetail;
        campusHeight=-campusSeam*.0015+(campusGrain-.5)*.001*tileDetail;
      #elif CAMPUS_SURFACE == 11
        campusSeam=campusJoint(campusUv,vec2(.17,.17),.003)*campusDetail;
        float module=campusJoint(campusUv,vec2(1.02,1.7),.016)*campusDetail;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.13,.17,.21),campusSeam*.5+module*.5);
      #elif CAMPUS_SURFACE == 6
        diffuseColor.rgb*=.88+.18*campusNoise(vec3(vCampusWorld.xz*.045,9.));
        float ripples=1.-smoothstep(.15,.8,length(fwidth(vCampusWorld.xz)));
        campusHeight=sin(vCampusWorld.x*2.3+vCampusWorld.z*1.1)*.004+sin(vCampusWorld.z*5.4-vCampusWorld.x*1.8)*.002;
        campusHeight+=sin(vCampusWorld.x*11.+vCampusWorld.z*3.2)*.0008*ripples;
      #endif
      #if CAMPUS_SURFACE == 3 || CAMPUS_SURFACE == 4 || CAMPUS_SURFACE == 7
        diffuseColor.rgb*=1.-campusWet*.16;
      #endif
      #ifdef CAMPUS_SCAN
        vec2 scanUv=campusUv/campusScanScale;
        vec3 scanColour=texture2D(campusAlbedoMap,scanUv).rgb;
        diffuseColor.rgb*=mix(vec3(1.),clamp(scanColour/campusScanMean,vec3(.35),vec3(1.8)),campusScanStrength.x);
      #endif
    `),s.fragmentShader=s.fragmentShader.replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      #if CAMPUS_SURFACE == 0 || CAMPUS_SURFACE == 3 || CAMPUS_SURFACE == 4 || CAMPUS_SURFACE == 8 || CAMPUS_SURFACE == 10 || CAMPUS_SURFACE == 13
        roughnessFactor=clamp(roughnessFactor+(campusGrain-.5)*.15*campusDetail+campusSeam*.12,.08,1.);
      #elif CAMPUS_SURFACE == 1
        roughnessFactor=clamp(roughnessFactor+campusPane*.045+campusSeam*.2,.06,.5);
      #endif
      #ifdef CAMPUS_SCAN
        roughnessFactor=clamp(roughnessFactor+(texture2D(campusRoughMap,scanUv).r-.5)*.22,.06,1.);
      #endif
    `),s.fragmentShader=s.fragmentShader.replace("#include <metalnessmap_fragment>",`
      #if CAMPUS_SURFACE == 3 || CAMPUS_SURFACE == 4 || CAMPUS_SURFACE == 7
        roughnessFactor=mix(roughnessFactor,.28,campusWet);
      #endif
      #include <metalnessmap_fragment>
    `),s.fragmentShader=s.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
      #if CAMPUS_SURFACE == 0 || CAMPUS_SURFACE == 1 || CAMPUS_SURFACE == 3 || CAMPUS_SURFACE == 4 || CAMPUS_SURFACE == 6 || CAMPUS_SURFACE == 7 || CAMPUS_SURFACE == 8 || CAMPUS_SURFACE == 10 || CAMPUS_SURFACE == 13
        vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition);
        vec3 rx=cross(dy,normal),ry=cross(normal,dx);
        float det=dot(dx,rx);
        normal=normalize(max(abs(det),1e-8)*normal-sign(det)*(dFdx(campusHeight)*rx+dFdy(campusHeight)*ry));
        nonPerturbedNormal=normal;
      #endif
      #ifdef CAMPUS_SCAN
        vec3 scanN=texture2D(campusScanNormal,scanUv).xyz*2.-1.;scanN.xy*=campusScanStrength.y*campusDetail;
        vec3 dp1=dFdx(-vViewPosition),dp2=dFdy(-vViewPosition);vec2 duv1=dFdx(scanUv),duv2=dFdy(scanUv);
        vec3 t=normalize(dp1*duv2.y-dp2*duv1.y),b=normalize(-dp1*duv2.x+dp2*duv1.x);
        normal=normalize(t*scanN.x+b*scanN.y+normal*max(.1,scanN.z));
      #endif
    `)},i.customProgramCacheKey=()=>`campus-finish-v5-${e}-${!!i.defines?.CAMPUS_BEVEL}-${!!i.defines?.CAMPUS_PANE_UV}-${!!i.defines?.CAMPUS_INTERIOR}-${!!i.defines?.CAMPUS_SKYLIGHT}-${!!t}`}function eg(){let i=new WeakMap,e=new WeakMap,t={},n=new Map,s={};return{setTextureLibrary(r){s=r;for(let[a,{type:o,name:l}]of n){let c=Rd(o,l,s);c&&(a.defines={...a.defines,CAMPUS_SCAN:1},Jm(a,o,c),a.needsUpdate=!0)}},material(r){if(i.has(r))return i.get(r);let a=yb(r.name),o;a==="glass"||a==="metal"||a==="water"||a==="solar"?(o=new ln,Wt.prototype.copy.call(o,r),o.defines={STANDARD:"",PHYSICAL:""}):o=r.clone(),o.name=r.name,o.userData={...r.userData,visualFinish:a,finishVersion:4,finishStatus:"Procedural appearance estimate; original geometry and source metadata retained"},r.userData.registeredPaneUv&&(o.defines={...o.defines,CAMPUS_PANE_UV:1}),r.userData.interiorDepthProxy&&(o.defines={...o.defines,CAMPUS_INTERIOR:1}),r.userData.skylightDepthProxy&&(o.defines={...o.defines,CAMPUS_SKYLIGHT:1}),(a==="stone"||a==="roof")&&/^(Approximate |Neutral roof|White concrete paint)/.test(r.name)&&(o.defines={...o.defines,CAMPUS_BEVEL:1},o.userData.visualBevelMetres=.08),o.dithering=!0,a==="glass"&&(o.color.lerp(new De("#8ca6ad"),.5),o.roughness=.11,o.metalness=0,o.clearcoat=0,o.clearcoatRoughness=.18,o.envMapIntensity=1.15,o.ior=1.52),a==="solar"&&(o.color.set("#13212d"),o.roughness=.29,o.metalness=0,o.clearcoat=.3,o.clearcoatRoughness=.13,o.envMapIntensity=.6),a==="metal"&&(o.roughness=.36,o.metalness=1,o.clearcoat=0,o.envMapIntensity=1.05),a==="water"&&(o.color.set("#365d50"),o.roughness=.18,o.metalness=0,o.clearcoat=0,o.clearcoatRoughness=.18,o.envMapIntensity=.75,o.ior=1.333),a==="ceramic"&&(o.color.set("#baa27a"),o.roughness=.72,o.metalness=0,o.envMapIntensity=.32),(a==="stone"||a==="cladding")&&(o.color.multiplyScalar(.86),o.roughness=a==="cladding"?.65:.78,o.metalness=0,o.envMapIntensity=.32),a==="roof"&&(o.color.multiplyScalar(.73),o.roughness=.82,o.metalness=.025,o.envMapIntensity=.4),a==="sport"&&(o.roughness=.94,o.metalness=0,o.envMapIntensity=.4),a==="asphalt"&&(o.color.set("#505b60"),o.roughness=.9,o.metalness=0),a==="paving"&&(o.color.set("#aaa79d"),o.roughness=.78),a==="datum"&&(o.color.set("#999b91"),o.roughness=.96,o.envMapIntensity=.4),a==="grass"&&(o.color.set("#58654b"),o.roughness=.95);let l=Km(a,r.name);o.userData.libraryId=l?.id||null,["glass","metal","water","solar","ceramic","roof","sport","asphalt","paving","grass"].includes(a)&&(o.roughness=l.roughness,o.metalness=l.metalness),a==="glass"&&(o.roughness=.16,o.specularIntensity=1,r.userData.interiorDepthProxy||(o.transparent=!0,o.opacity=.84,o.depthWrite=!1)),a==="metal"&&(o.roughness=.36),a==="water"&&(o.roughness=.22);let c=r.map||r.normalMap?null:Rd(a,r.name,s);return!r.map&&!r.normalMap&&n.set(o,{type:a,name:r.name}),c&&(o.defines={...o.defines,CAMPUS_SCAN:1}),Jm(o,a,c),i.set(r,o),t[a]=(t[a]||0)+1,o},prepareMesh(r){if(!r.material.userData.visualBevelMetres)return;let a=r.geometry;e.has(a)||e.set(a,Gm(a)),r.geometry=e.get(a)},get counts(){return{...t}},get textureLibrary(){return{loadedAssets:Object.keys(s),maps:Object.keys(s).length*3,resolution:Object.values(s)[0]?.Diffuse?.image?.width||0,localFiles:!0,sourceTexturesPreserved:!0}}}}function tg({renderer:i,scene:e,camera:t,controls:n,invalidate:s,initialQuality:r="high",deferEnvironment:a=!1}){let o=!a,l="clear",c=us[r]?r:"high",u=[1,1],h=new C(1/0,0,0),d=0,f=qc(),g=Om({renderer:i,scene:e,camera:t}),_=Vm({renderer:i,scene:e,camera:t}),m=jm({scene:e,camera:t}),p=new ro;p.scale.setScalar(2e4),p.name="Daylight atmosphere",p.material.uniforms.turbidity.value=3,p.material.uniforms.rayleigh.value=2.2,p.material.uniforms.mieCoefficient.value=.003,p.material.uniforms.mieDirectionalG.value=.82,p.material.uniforms.weatherCloud={value:0},p.material.fragmentShader=`
    uniform float weatherCloud;
    float skyHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float skyNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(skyHash(i),skyHash(i+vec2(1,0)),f.x),mix(skyHash(i+vec2(0,1)),skyHash(i+vec2(1,1)),f.x),f.y);}
  `+p.material.fragmentShader.replace("gl_FragColor = vec4( retColor, 1.0 );",`
    vec2 cloudUv=direction.xz/max(direction.y+.18,.08)*2.4;
    float cloudNoise=.57*skyNoise(cloudUv)+.28*skyNoise(cloudUv*2.1)+.15*skyNoise(cloudUv*4.3);
    float cloud=smoothstep(.49,.73,cloudNoise)*smoothstep(.015,.2,direction.y);
    retColor=mix(retColor,vec3(.95,1.02,1.08)*(1.1+cloudNoise*.8),cloud*.78);
    retColor=mix(retColor,vec3(.65,.73,.81)*(1.0+cloudNoise*.45),weatherCloud*.88);
    gl_FragColor = vec4( retColor, 1.0 );
  `),e.add(p);let M=new ka(14083827,7434596,.38);e.add(M);let x=new Fs(16773337,3);x.castShadow=!0,x.shadow.mapSize.setScalar(us[c].shadow),x.shadow.radius=3,x.shadow.bias=-8e-5,x.shadow.normalBias=.1,x.shadow.camera.near=1,x.shadow.camera.far=7e3,e.add(x,x.target);let y=new kr(i),w,T,P,A,S=!1,b=!0,R=new br(256,{type:Ut}),L=new vr(1,12e3,R),F=new C(1/0,0,0),z=new C;function V(pe,{rebuild:q=!0}={}){f=qc({...f,...pe}),Cd.value=f.wetness;let Z=ft.degToRad(f.elevation),me=ft.degToRad(f.azimuth);z.set(Math.sin(me)*Math.cos(Z),Math.sin(Z),Math.cos(me)*Math.cos(Z)),p.material.uniforms.sunPosition.value.copy(z);let Ee=f.elevation<35;x.color.set(Ee?16767926:16774120),x.intensity=f.sunlight,M.intensity=f.ambient,e.fog=new Sr(Ee?14998218:13952237,f.haze*.001);let ye=so[l];if(p.material.uniforms.weatherCloud.value=Math.max(.3,ye.cloud),x.intensity*=ye.sun,M.intensity*=ye.ambient,l!=="clear"&&(e.fog=new Sr(ye.color,Math.max(f.haze*.001,ye.fog))),e.environmentIntensity=f.reflection,i.toneMappingExposure=f.exposure,ce.blendIntensity=f.occlusion,q&&o){if(S=!!(P&&f.elevation>=35&&(l==="clear"||l==="cloudy")),p.visible=!S,e.background=S?P:null,e.backgroundIntensity=.78,e.backgroundBlurriness=.015,e.backgroundRotation.set(0,me,0),e.environmentRotation.set(0,S?me:0,0),S)w&&w!==A&&w.dispose(),w=A;else{let Le=new Rs,dt=p.clone();Le.add(dt);let U=y.fromScene(Le,.025,.1,3e4);w&&w!==A&&w.dispose(),w=U}e.environment=w.texture}q&&(b=!0),_.invalidate(),m.invalidate(),g.invalidate(),d=0,Re(!0),s()}function B(pe="day"){V(po[pe]||po.day)}let ne=new Vt(1,1,{type:Ut,samples:c==="balanced"?2:4}),G=new Hc(i,ne);G.setPixelRatio(1);let le=new Vc(e,t),ce=new uo(e,t,1,1,void 0,{radius:3.2,thickness:1.4,distanceExponent:1.5,scale:1,samples:12});ce.blendIntensity=.7,G.addPass(le),G.addPass(ce),G.addPass(new jc);function Me(pe,q){u=[pe,q],G.setSize(pe,q),ce.setSize(Math.max(1,Math.round(pe*.5)),Math.max(1,Math.round(q*.5)))}function Re(pe=!1){let q=t.position.distanceTo(n.target),Z=ft.clamp(q*.65,100,1700);return!pe&&Math.abs(Z-d)<d*.2&&h.distanceTo(n.target)<Z*.15?!1:(h.copy(n.target),d=Z,x.target.position.copy(h),x.position.copy(h).addScaledVector(z,3e3),Object.assign(x.shadow.camera,{left:-Z,right:Z,top:Z,bottom:-Z}),x.shadow.camera.updateProjectionMatrix(),i.shadowMap.needsUpdate=!0,!0)}function Fe(pe){c=us[pe]?pe:"high",ce.enabled=us[c].ao;let q=us[c].shadow;x.shadow.mapSize.x!==q&&(x.shadow.mapSize.setScalar(q),x.shadow.map?.dispose(),x.shadow.map=null),b=!0,Re(!0),s()}function Ve(){if(!w)return;if(c==="balanced"||t.position.distanceTo(n.target)>1500){e.environment=w.texture,e.environmentRotation.set(0,S?ft.degToRad(f.azimuth):0,0);return}if(!b&&F.distanceTo(n.target)<120){e.environment=T?.texture||w.texture,e.environmentRotation.set(0,T?0:S?ft.degToRad(f.azimuth):0,0);return}F.copy(n.target),L.position.copy(n.target),L.position.y=Math.max(18,n.target.y+12);let pe=e.environment;e.environment=w.texture,e.environmentRotation.set(0,S?ft.degToRad(f.azimuth):0,0);let q=[];e.traverse(Z=>{Z.isReflector&&Z.visible&&(q.push(Z),Z.visible=!1)});try{L.update(i,e);let Z=y.fromCubemap(R.texture);T?.dispose(),T=Z,e.environment=Z.texture,e.environmentRotation.set(0,0,0),b=!1}catch(Z){throw e.environment=pe,Z}finally{q.forEach(Z=>Z.visible=!0)}}return B(),{compileScene:async()=>{let pe=i.getRenderTarget();try{i.setRenderTarget(G.readBuffer),await i.compileAsync(e,t)}finally{i.setRenderTarget(pe)}},loadEnvironment:async({mobile:pe=!1,beforePrepare:q=async()=>{}}={})=>{try{P=await new zc().loadAsync(cs(pe?"/campus-map/data/materials/mobile/overcast_soil_puresky_256.hdr":"/campus-map/data/materials/overcast_soil_puresky_1k.hdr")),await q(),P.mapping=Lr,A=y.fromEquirectangular(P)}catch(Z){console.warn("HDR environment unavailable; procedural daylight retained",Z)}o=!0,V({})},prepareEnvironment:()=>{o=!0,V({})},setWeather:pe=>{l=Object.hasOwn(so,pe)?pe:"clear",V({})},render:(pe=!1)=>{let q={moving:pe,quality:c,strength:f.reflection,wetness:f.wetness};g.prepare(q),_.prepare(q),m.prepare(q),ce.enabled=us[c].ao&&!pe&&f.occlusion>0,G.render()},resize:Me,setQuality:Fe,daylight:B,configure:V,updateShadows:Re,updateEnvironment:Ve,attachWater:pe=>{_.attach(pe),m.attach(pe)},invalidateEnvironment:()=>{b=!0,_.invalidate(),m.invalidate(),g.invalidate()},get quality(){return c},get size(){return[...u]},diagnostics:()=>({quality:c,weather:l,settings:{...f},groundReflection:g.diagnostics,waterReflection:_.diagnostics,glassReflection:m.diagnostics,ambientOcclusion:ce.enabled,shadowSize:x.shadow.mapSize.toArray(),shadowRadius:d,indirectLighting:"PMREM image-based approximation; no traced GI",skySource:S?"Poly Haven overcast_soil_puresky CC0":"procedural atmosphere",wetness:Cd.value,environment:e.environment===T?.texture?"cached campus reflection":"procedural daylight",resolution:[...u]})}}function Xc(i,e){i.replaceChildren();function t(n,s){let r=/\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,a=0;for(let o of s.matchAll(r)){n.append(document.createTextNode(s.slice(a,o.index)));let l=document.createElement(o[1]?"strong":o[2]?"code":"a");l.textContent=o[1]||o[2]||o[3],o[4]&&(l.href=o[4],l.target="_blank",l.rel="noreferrer noopener"),n.append(l),a=o.index+o[0].length}n.append(document.createTextNode(s.slice(a)))}for(let n of String(e).split(`
`)){let s=n.startsWith("> "),r=/^[-*] /.test(n),a=document.createElement(s?"blockquote":"p");t(a,s?n.slice(2):r?"\u2022 "+n.slice(2):n||"\xA0"),i.append(a)}}var ng="campus-local-usage";function ig(i){let e={enabled:!1,counts:{}};try{let c=JSON.parse(localStorage.getItem(ng));c&&typeof c.enabled=="boolean"&&c.counts&&typeof c.counts=="object"&&(e=c)}catch{}let t={search:"\u5730\u70B9\u641C\u7D22",place:"\u67E5\u770B\u5730\u70B9",rotate:"\u65CB\u8F6C\u6A21\u5F0F",render:"4K \u6E32\u67D3",share:"\u89C6\u89D2\u5206\u4EAB",layers:"\u56FE\u5C42\u5DE5\u5177"},n=document.createElement("section");n.innerHTML='<h3>\u672C\u673A\u4F7F\u7528\u8BA1\u6570</h3><label class="check"><input id="local-usage-consent" type="checkbox">\u542F\u7528\u672C\u673A\u529F\u80FD\u8BA1\u6570</label><p class="tool-note">\u53EA\u7D2F\u8BA1\u4E0B\u5217\u529F\u80FD\u7684\u6B21\u6570\uFF0C\u53EF\u968F\u65F6\u5173\u95ED\uFF1B\u4E0D\u8BB0\u5F55\u641C\u7D22\u6587\u5B57\u548C\u4F4D\u7F6E\u3002</p><div id="local-usage-counts"></div><button id="clear-local-usage">\u6E05\u9664\u8BA1\u6570</button>',i.append(n);let s=n.querySelector("input"),r=n.querySelector("#local-usage-counts");s.checked=e.enabled;function a(){r.replaceChildren();for(let[c,u]of Object.entries(t)){let h=document.createElement("p");h.textContent=`${u} \xB7 ${Number(e.counts[c])||0}`,r.append(h)}}function o(){try{localStorage.setItem(ng,JSON.stringify(e))}catch{}a()}s.onchange=()=>{e.enabled=s.checked,o()},n.querySelector("button").onclick=()=>{e.counts={},o()};let l=c=>{e.enabled&&(e.counts[c]=(Number(e.counts[c])||0)+1,o())};document.querySelector("#building-search").addEventListener("change",()=>l("search")),document.addEventListener("click",c=>{let u=c.target.closest("button");u&&(u.matches(".map-label,.search-result")?l("place"):u.matches('[data-drag-mode="rotate"]')?l("rotate"):u.matches("#export-4k,#studio-export")?l("render"):u.matches("#share-view,#share-place")?l("share"):u.matches("#open-campus-tools")&&l("layers"))}),a()}var Wr={buildings:!0,roads:!0,water:!0,green:!0,ground:!0,labels:!0};function go(i,e=[]){let t=new URLSearchParams(i.replace(/^#/,"")),n=h=>h?.split(",").map(Number),s=n(t.get("target")),r=n(t.get("camera")),a=t.get("campus"),o=h=>Array.isArray(h)&&h.length===3&&h.every(d=>Number.isFinite(d)&&Math.abs(d)<2e4),l=t.get("place")||t.get("poi"),c=e.find(h=>h.id===l||h.id.split("/")[1]===l);if(o(s)&&o(r)&&["all","1","2"].includes(a)){let h=r.map((f,g)=>f-s[g]),d=Math.hypot(...h);if(d>=1&&d<=6501&&s[1]>=0&&s[1]<=80&&h[1]/d>=Math.cos(78*Math.PI/180)-1e-4)return{view:a,target:s,position:r,place:c?.id||null}}let u=t.get("map")?.split("/").map(Number);if(u?.length===3&&u.every(Number.isFinite)){let h=Si(u[2],u[1]);if(Math.hypot(...h)<5e3){let d=ft.clamp(800*2**(17-u[0]),100,3e3);return{view:"all",target:[h[0],0,-h[1]],position:[h[0]+d*.4,d*.7,-h[1]+d*.7],place:c?.id||null}}}return c?{place:c.id}:null}function mo(i){let e=n=>n.map(s=>Number(s.toFixed(3))).join(","),t=new URLSearchParams({campus:i.view,target:e(i.target),camera:e(i.position)});return i.place&&t.set("place",i.place),"#"+t.toString()}function ki(i,e){try{return JSON.parse(localStorage.getItem(i))??e}catch{return e}}function _i(i,e){try{localStorage.setItem(i,JSON.stringify(e))}catch{}}function We(i,e,t){let n=document.createElement(i);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n}function sg({buildings:i,placeData:e,camera:t,controls:n,scene:s,choose:r,focusPoint:a,restoreView:o,getView:l,applyLayers:c,refresh:u,invalidate:h}){let d=N=>document.querySelector(N),f=e.places,g=[...i,...f.filter(N=>!i.some(X=>X.id===N.id))],_=ki("campus-favorites",[]),m=ki("campus-place-categories",null),p=new Set((Array.isArray(_)?_:[]).filter(N=>g.some(X=>X.id===N))),M=ki("campus-layers",{}),x=Object.fromEntries(Object.entries(Wr).map(([N,X])=>[N,typeof M?.[N]=="boolean"?M[N]:X])),y=ri.filter(([N])=>N!=="all").map(([N])=>N),w=new Set(Array.isArray(m)?m.filter(N=>y.includes(N)):y);Array.isArray(m)&&y.filter(N=>N!=="transport").every(N=>m.includes(N))&&w.add("transport");let T=null,P=null,A=null,S=null,b=null,R=null,L=1,F="",z={},V=!1,B=null,ne=ki("campus-comment-owner",null);typeof ne!="string"&&(ne=crypto.randomUUID(),_i("campus-comment-owner",ne));let G=We("dialog","campus-dialog");G.id="campus-dialog",G.innerHTML=`<div class="dialog-heading"><div><small>YOUR CAMPUS</small><h2>\u6821\u56ED\u5DE5\u5177</h2></div><button id="close-campus-tools" class="icon-button" data-ui-icon="close" aria-label="\u5173\u95ED\u6821\u56ED\u5DE5\u5177"></button></div>
    <nav class="tools-tabs" aria-label="\u6821\u56ED\u5DE5\u5177\u5206\u7C7B"><button data-tools-tab="layers">\u56FE\u5C42</button><button data-tools-tab="favorites">\u6536\u85CF</button><button data-tools-tab="comments">\u7559\u8A00</button><button data-tools-tab="about">\u8D44\u6599</button></nav>
    <section data-tools-panel="layers"><h3>\u5730\u56FE\u5185\u5BB9</h3><div id="scene-layers" class="layer-grid"></div><h3>\u6821\u56ED\u751F\u6D3B\u5730\u70B9</h3><div class="small-actions"><button id="all-place-categories">\u5168\u9009</button><button id="no-place-categories">\u6E05\u7A7A</button></div><div id="place-category-layers" class="layer-grid"></div><p class="tool-note">\u56FE\u5C42\u4E0E\u7C7B\u522B\u4F1A\u4FDD\u5B58\u5728\u8FD9\u53F0\u8BBE\u5907\u3002\u641C\u7D22\u7ED3\u679C\u548C\u5730\u56FE\u540D\u79F0\u540C\u6B65\u7B5B\u9009\u3002</p></section>
    <section data-tools-panel="favorites" hidden><h3>\u6211\u7684\u6821\u56ED\u6E05\u5355</h3><p class="tool-note">\u6536\u85CF\u5EFA\u7B51\u6216\u5730\u70B9\uFF0C\u4E0B\u6B21\u53EF\u76F4\u63A5\u5B9A\u4F4D\uFF1B\u4FDD\u5B58\u5728\u5F53\u524D\u8BBE\u5907\u3002</p><div id="favorite-list"></div></section>
    <section data-tools-panel="comments" hidden><div class="comment-context"><h3 id="comment-context-title">\u5168\u90E8\u5730\u70B9\u7559\u8A00</h3><button id="all-comments">\u67E5\u770B\u5168\u90E8</button></div><p class="tool-note">\u7559\u8A00\u4FDD\u5B58\u5728\u672C\u5730\u9884\u89C8\u670D\u52A1\uFF0C\u8FDE\u63A5\u540C\u4E00\u670D\u52A1\u7684\u6D4F\u89C8\u5668\u53EF\u89C1\u3002</p><div id="comment-list"></div><div class="comment-pagination"><button id="comments-prev">\u4E0A\u4E00\u9875</button><span id="comments-page"></span><button id="comments-next">\u4E0B\u4E00\u9875</button></div>
    <form id="comment-form"><label>\u6635\u79F0<input id="comment-author" maxlength="30" required autocomplete="nickname"></label><label>\u7559\u8A00\u6216\u66F4\u6B63<textarea id="comment-body" rows="3" minlength="2" maxlength="1200" required placeholder="\u5206\u4EAB\u5730\u70B9\u4F53\u9A8C\uFF0C\u6216\u8BF4\u660E\u9700\u8981\u66F4\u6B63\u7684\u4FE1\u606F"></textarea></label><div id="reply-context" hidden></div><label>\u9644\u56FE\uFF08\u53EF\u9009\uFF0C\u538B\u7F29\u540E\u6700\u591A 500KB\uFF09<input id="comment-image" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="submit" id="send-comment">\u53D1\u5E03\u7559\u8A00</button><p id="comment-status" role="status"></p></form></section>
    <section data-tools-panel="about" hidden><h3>\u6570\u636E\u4E0E\u79BB\u7EBF</h3><p id="place-data-date"></p><div class="tool-actions"><button id="refresh-places">\u5237\u65B0\u5730\u70B9\u6570\u636E</button><button id="download-offline">\u4FDD\u5B58\u79BB\u7EBF\u5730\u56FE</button><button id="install-campus" hidden>\u5B89\u88C5\u5230\u8BBE\u5907</button></div><p id="offline-state" role="status"></p><p>\u5EFA\u7B51\u4F53\u91CF\u6CBF\u7528\u5DF2\u767B\u8BB0\u6A21\u578B\u3002\u5730\u70B9\u6765\u81EA OpenStreetMap \u516C\u5F00\u8BB0\u5F55\uFF0C\u5E97\u94FA\u3001\u697C\u5C42\u3001\u8425\u4E1A\u65F6\u95F4\u4E0E\u901A\u884C\u60C5\u51B5\u53EF\u80FD\u53D8\u5316\u3002</p><p>\u672C\u6B21\u6750\u8D28\u3001\u65E5\u5149\u3001\u53CD\u5C04\u548C\u5FAE\u8868\u9762\u53C2\u6570\u7528\u4E8E\u89C6\u89C9\u8868\u73B0\uFF1B\u5730\u56FE\u8F6E\u5ED3\u53CA\u7167\u7247\u4F30\u7B97\u4E0D\u7B49\u4E8E\u5B9E\u6D4B\u5EFA\u7B51\u3002</p><p>\u5B9A\u4F4D\u53EA\u5728\u70B9\u51FB\u540E\u7533\u8BF7\uFF0C\u5750\u6807\u4FDD\u7559\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u5185\u5B58\u3002\u5173\u95ED\u5B9A\u4F4D\u5373\u505C\u6B62\u8DDF\u8E2A\u3002\u5E94\u7528\u4E0D\u52A0\u8F7D\u7B2C\u4E09\u65B9\u7EDF\u8BA1\u811A\u672C\u3002</p><p>\u6821\u56ED\u4EA4\u6D41\u8BF7\u4F7F\u7528\u4F1A\u540C\u91CC\u7684\u6821\u56ED\u793E\u533A\u3002</p><p><a href="https://github.com/HaoTian22/BNBU-Map" target="_blank" rel="noreferrer">\u53C2\u8003\u9879\u76EE BNBU-Map</a> \xB7 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">\xA9 OpenStreetMap contributors \xB7 ODbL</a></p></section>`,document.body.appendChild(G),ig(G.querySelector('[data-tools-panel="about"]'));let le=We("section");le.innerHTML='<h3>\u5730\u70B9\u81EA\u52A8\u66F4\u65B0</h3><label class="check"><input id="auto-refresh-places" type="checkbox">\u6BCF\u5929 03:10 \u66F4\u65B0\u5730\u70B9</label><p id="maintenance-state" class="tool-note">\u672C\u5730\u670D\u52A1\u8FD0\u884C\u671F\u95F4\u751F\u6548\uFF0C\u66F4\u65B0\u65F6\u95F4\u4E3A\u5317\u4EAC\u65F6\u95F4\u3002</p>',G.querySelector('[data-tools-panel="about"]').append(le);let ce=d("#auto-refresh-places");function Me(N){if(N.managed){ce.disabled=!0,ce.closest("label").hidden=!0,d("#refresh-places").hidden=!0,le.querySelector("h3").textContent="\u5730\u70B9\u6570\u636E",d("#maintenance-state").textContent="\u5730\u70B9\u8D44\u6599\u7531\u7AD9\u70B9\u7EDF\u4E00\u7EF4\u62A4\uFF0C\u66F4\u65B0\u65E5\u671F\u89C1\u4E0A\u65B9\u8BF4\u660E\u3002";return}ce.checked=N.enabled,d("#maintenance-state").textContent=N.enabled?`\u4E0B\u6B21 ${new Date(N.nextAt).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai"})}\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09 \xB7 \u672C\u5730\u670D\u52A1\u8FD0\u884C\u671F\u95F4\u751F\u6548${N.lastError?" \xB7 \u4E0A\u6B21\u5931\u8D25\uFF0C\u5C06\u91CD\u8BD5":""}`:"\u81EA\u52A8\u66F4\u65B0\u5DF2\u5173\u95ED\u3002\u53EF\u4EE5\u968F\u65F6\u624B\u52A8\u5237\u65B0\u5730\u70B9\u3002"}fetch("/api/maintenance").then(N=>N.ok?N.json():null).then(N=>{N&&Me(N)}).catch(()=>{}),ce.onchange=async()=>{ce.disabled=!0;try{let N=await fetch("/api/maintenance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:ce.checked})});if(!N.ok)throw Error();Me(await N.json())}catch{ce.checked=!ce.checked,Le("\u65E0\u6CD5\u4FDD\u5B58\u81EA\u52A8\u66F4\u65B0\u8BBE\u7F6E")}finally{ce.disabled=!1}};let Re=We("label","field","\u7559\u8A00\u6392\u5E8F"),Fe=We("select");Fe.id="comment-sort",Fe.setAttribute("aria-label","\u7559\u8A00\u6392\u5E8F");for(let[N,X]of[["newest","\u6700\u65B0\u53D1\u5E03"],["oldest","\u6700\u65E9\u53D1\u5E03"],["popular","\u6700\u591A\u8D5E\u540C"]])Fe.add(new Option(X,N));Re.append(Fe),d("#comment-list").before(Re),Fe.onchange=()=>{L=1,$e()};let Ve=We("button","","\u53D6\u6D88\u7F16\u8F91");Ve.id="cancel-comment-edit",Ve.type="button",Ve.hidden=!0,d("#comment-form").prepend(Ve);let pe=We("button","","\u9884\u89C8\u7559\u8A00");pe.type="button",pe.id="preview-comment";let q=We("div","comment-preview");q.hidden=!0,q.setAttribute("aria-label","\u7559\u8A00\u9884\u89C8"),pe.onclick=()=>{q.hidden=!q.hidden,Xc(q,d("#comment-body").value),pe.textContent=q.hidden?"\u9884\u89C8\u7559\u8A00":"\u6536\u8D77\u9884\u89C8"},d("#send-comment").before(pe,q);let Z=We("div","small-actions");for(let N of["\u{1F44D}","\u2764\uFE0F","\u{1F60A}","\u{1F4CD}"]){let X=We("button","",N);X.type="button",X.setAttribute("aria-label","\u63D2\u5165 "+N),X.onclick=()=>{let I=d("#comment-body");I.setRangeText(N,I.selectionStart,I.selectionEnd,"end"),I.dispatchEvent(new Event("input")),I.focus()},Z.append(X)}d("#comment-image").parentElement.before(Z);let me=We("small","tool-note","\u652F\u6301 **\u52A0\u7C97**\u3001`\u4EE3\u7801`\u3001> \u5F15\u7528\u548C [\u6587\u5B57](https://\u94FE\u63A5)");d("#comment-body").after(me);function Ee(){B=null,Ve.hidden=!0,d("#send-comment").textContent="\u53D1\u5E03\u7559\u8A00",d("#comment-body").value=ki("campus-draft-"+(F||"campus"),"")}Ve.onclick=Ee;let ye;function Le(N){let X=d("#map-toast");X.textContent=N,X.hidden=!1,clearTimeout(ye),ye=setTimeout(()=>X.hidden=!0,4500)}function dt(N="layers"){for(let X of G.querySelectorAll("[data-tools-tab]"))X.setAttribute("aria-pressed",String(X.dataset.toolsTab===N));for(let X of G.querySelectorAll("[data-tools-panel]"))X.hidden=X.dataset.toolsPanel!==N;G.open||G.showModal(),N==="favorites"&&ze(),N==="comments"&&$e()}d("#close-campus-tools").onclick=()=>G.close(),G.addEventListener("click",N=>{N.target===G&&G.close()}),d("#open-campus-tools").onclick=()=>dt(),G.querySelectorAll("[data-tools-tab]").forEach(N=>N.onclick=()=>dt(N.dataset.toolsTab));for(let[N,X]of Object.entries({buildings:"\u4E09\u7EF4\u5EFA\u7B51",roads:"\u9053\u8DEF\u4E0E\u94FA\u88C5",water:"\u6C34\u9762",green:"\u7EFF\u5730\u4E0E\u8FD0\u52A8\u573A",ground:"\u6821\u56ED\u5E95\u56FE",labels:"\u540D\u79F0\u6807\u6CE8"})){let I=We("label","layer-choice"),j=We("input");j.type="checkbox",j.checked=x[N],j.dataset.layer=N,j.onchange=()=>{x[N]=j.checked,N==="labels"&&(d("#show-labels").checked=j.checked),_i("campus-layers",x),c(x),u(),h()},I.append(j,document.createTextNode(X)),d("#scene-layers").append(I)}d("#show-labels").checked=x.labels,d("#show-labels").addEventListener("change",()=>{x.labels=d("#show-labels").checked,d('#scene-layers input[data-layer="labels"]').checked=x.labels,_i("campus-layers",x),u(),h()});function U(){_i("campus-place-categories",[...w]),d("#place-category-layers").querySelectorAll("input").forEach(N=>N.checked=w.has(N.value)),u(),h()}for(let[N,X]of ri.filter(([I])=>I!=="all")){let I=We("label","layer-choice"),j=We("input");j.type="checkbox",j.value=N,j.checked=w.has(N),j.onchange=()=>{j.checked?w.add(N):w.delete(N),U()},I.append(j,document.createTextNode(X)),d("#place-category-layers").append(I)}d("#all-place-categories").onclick=()=>{ri.forEach(([N])=>{N!=="all"&&w.add(N)}),U()},d("#no-place-categories").onclick=()=>{w.clear(),U()};let at=[...new Set(f.map(N=>N.floor).filter(Boolean))].sort((N,X)=>N.localeCompare(X,void 0,{numeric:!0}));for(let N of at){let X=We("option","",N+" \u5C42");X.value=N,d("#place-floor").append(X)}function ze(){let N=d("#favorite-list");N.replaceChildren();let X=g.filter(I=>p.has(I.id));X.length||N.append(We("p","tool-note","\u8FD8\u6CA1\u6709\u6536\u85CF\u3002\u6253\u5F00\u4EFB\u610F\u5EFA\u7B51\u6216\u5730\u70B9\uFF0C\u70B9\u51FB\u201C\u6536\u85CF\u201D\u3002"));for(let I of X){let j=We("div","favorite-row"),ie=We("button","",I.display_name||I.name),se=We("button","","\u79FB\u9664");ie.onclick=()=>{G.close(),r(I)},se.onclick=()=>{p.delete(I.id),_i("campus-favorites",[...p]),ze(),T?.id===I.id&&Y()},j.append(ie,se),N.append(j)}}function Y(){let N=d("#favorite-place");N&&T&&(sn(N,"star",p.has(T.id)?"\u5DF2\u6536\u85CF":"\u6536\u85CF"),N.setAttribute("aria-pressed",String(p.has(T.id))))}async function ue(N=T){let X=l();X.place=N?.id||X.place;let I=window.location.origin+window.location.pathname+mo(X);try{await navigator.clipboard.writeText(I),Le("\u89C6\u89D2\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u6253\u5F00\u94FE\u63A5\u53EF\u6062\u590D\u4F4D\u7F6E\u4E0E\u5730\u70B9")}catch{let j=We("input","share-fallback");j.readOnly=!0,j.value=I,d("#detail-body").prepend(j),j.select(),Le("\u8BF7\u590D\u5236\u9009\u4E2D\u7684\u89C6\u89D2\u94FE\u63A5")}}function ke(N,X){T=N;let I=We("div","place-actions"),j=We("button","","\u6536\u85CF");j.id="favorite-place",j.onclick=()=>{p.has(N.id)?p.delete(N.id):p.add(N.id),_i("campus-favorites",[...p]),Y()};let ie=sn(We("button"),"share","\u5206\u4EAB\u89C6\u89D2");ie.onclick=()=>ue(N);let se=sn(We("button"),"comment",`\u7559\u8A00${z[N.id]?" \xB7 "+z[N.id]:""}`);se.dataset.commentPlace=N.id,se.onclick=()=>{F=N.id,L=1,R=null,Ee(),dt("comments")},I.append(j,ie),d("#detail-body").prepend(I),Y();let ae=f.filter(te=>te.building_id===N.id&&te.id!==N.id);if(ae.length&&X){let te=We("button","inside-places",`\u67E5\u770B\u697C\u5185 ${ae.length} \u5904\u5730\u70B9`);te.onclick=()=>X(N.id),I.after(te)}}let fe=0;function Ie(N){z=N,document.querySelectorAll("[data-comment-place]").forEach(X=>{let I=N[X.dataset.commentPlace];sn(X,"comment",`\u7559\u8A00${I?" \xB7 "+I:""}`)})}fetch("/api/community?counts=1").then(N=>N.ok?N.json():null).then(N=>{N&&Ie(N.counts)}).catch(()=>{});async function $e(){let N=++fe,X=g.find(j=>j.id===F);d("#comment-context-title").textContent=X?(X.display_name||X.name)+" \xB7 \u7559\u8A00":F==="campus"?"\u6821\u56ED\u7559\u8A00":"\u5168\u90E8\u5730\u70B9\u7559\u8A00",B||(d("#comment-body").value=ki("campus-draft-"+(F||"campus"),"")),d("#reply-context").hidden=!R;let I=d("#comment-list");I.textContent="\u6B63\u5728\u8BFB\u53D6\u7559\u8A00\u2026";try{let j=await fetch(`/api/community?place=${encodeURIComponent(F)}&page=${L}&sort=${Fe.value}`,{headers:{"X-Campus-Owner":ne}});if(!j.ok)throw Error("\u7559\u8A00\u670D\u52A1\u6682\u4E0D\u53EF\u7528");let ie=await j.json();if(N!==fe)return;Ie(ie.counts),I.replaceChildren(),ie.comments.length||I.append(We("p","tool-note","\u8FD8\u6CA1\u6709\u7559\u8A00\uFF0C\u5199\u4E0B\u7B2C\u4E00\u6761\u4F53\u9A8C\u6216\u66F4\u6B63\u3002"));for(let se of ie.comments){let ae=We("article","comment-card");ae.append(We("strong","",se.author),We("time","",new Date(se.createdAt).toLocaleString("zh-CN"))),se.parentId&&ae.append(We("blockquote","reply-label",se.parent?`${se.parent.author}\uFF1A${se.parent.body}`:"\u539F\u7559\u8A00\u5DF2\u9690\u85CF")),se.updatedAt&&ae.append(We("small","reply-label","\u5DF2\u7F16\u8F91"));let te=We("div","comment-content");if(Xc(te,se.body),ae.append(te),se.image){let Pt=We("img");Pt.src=se.image,Pt.alt="\u7559\u8A00\u9644\u56FE",Pt.loading="lazy",ae.append(Pt)}let we=We("div","small-actions"),Ne=g.find(Pt=>Pt.id===se.placeId),ot=We("button","",`\u8D5E\u540C ${se.likes||0}`);if(ot.setAttribute("aria-pressed",String(se.liked)),ot.onclick=async()=>{ot.disabled=!0;try{await Ze({action:"like",id:se.id,owner:ne}),await $e()}catch{Le("\u6682\u65F6\u65E0\u6CD5\u70B9\u8D5E")}finally{ot.disabled=!1}},we.append(ot),Ne){let Pt=We("button","",Ne.display_name||Ne.name);Pt.onclick=()=>{G.close(),r(Ne)},we.append(Pt)}let rt=We("button","","\u56DE\u590D");if(rt.onclick=()=>{Ee(),R=se.id,F=se.placeId,d("#comment-context-title").textContent=(Ne?.display_name||Ne?.name||"\u6821\u56ED")+" \xB7 \u7559\u8A00",d("#comment-body").value=ki("campus-draft-"+F,""),d("#reply-context").hidden=!1,d("#reply-context").textContent=`\u56DE\u590D ${se.author}\uFF08\u70B9\u51FB\u53D6\u6D88\uFF09`,d("#comment-body").focus()},we.append(rt),se.mine){let Pt=We("button","","\u7F16\u8F91");Pt.onclick=()=>{B=se.id,R=null,Ve.hidden=!1,d("#reply-context").hidden=!0,d("#send-comment").textContent="\u4FDD\u5B58\u4FEE\u6539",d("#comment-author").value=se.author,d("#comment-body").value=se.body,d("#comment-body").focus()},we.append(Pt);let fn=We("button","","\u9690\u85CF");fn.onclick=async()=>{fn.disabled=!0;try{await Ze({action:"hide",id:se.id,owner:ne}),B===se.id&&Ee(),await $e()}catch{Le("\u9690\u85CF\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"),fn.disabled=!1}},we.append(fn)}ae.append(we),I.append(ae)}d("#comments-page").textContent=`${L} / ${Math.max(1,Math.ceil(ie.total/20))}`,d("#comments-prev").disabled=L<=1,d("#comments-next").disabled=L*20>=ie.total}catch{N===fe&&(I.textContent="\u7559\u8A00\u670D\u52A1\u6682\u4E0D\u53EF\u7528\u3002\u6587\u5B57\u4F1A\u4FDD\u7559\u4E3A\u8349\u7A3F\uFF0C\u8054\u7F51\u540E\u53EF\u518D\u6B21\u53D1\u5E03\u3002")}}async function Ze(N){let X=await fetch("/api/community",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(N)}),I=await X.json();if(!X.ok)throw Error(I.error||"\u53D1\u5E03\u5931\u8D25");return I}async function D(N){if(!N)return null;if(!["image/png","image/jpeg","image/webp"].includes(N.type)||N.size>8*1024*1024)throw Error("\u8BF7\u9009\u62E9 8MB \u4EE5\u5185\u7684 PNG\u3001JPEG \u6216 WebP");let X=await createImageBitmap(N),I=Math.min(1,1200/Math.max(X.width,X.height)),j=document.createElement("canvas");j.width=Math.round(X.width*I),j.height=Math.round(X.height*I),j.getContext("2d").drawImage(X,0,0,j.width,j.height),X.close();let ie=j.toDataURL("image/jpeg",.8);if(ie.length>7e5)throw Error("\u538B\u7F29\u540E\u7684\u56FE\u7247\u4ECD\u8FC7\u5927\uFF0C\u8BF7\u88C1\u526A\u540E\u518D\u8BD5");return ie}d("#comment-author").value=ki("campus-nickname",""),d("#comment-body").addEventListener("input",()=>{B||_i("campus-draft-"+(F||"campus"),d("#comment-body").value),q.hidden||Xc(q,d("#comment-body").value)}),d("#reply-context").onclick=()=>{R=null,d("#reply-context").hidden=!0},d("#comment-form").onsubmit=async N=>{N.preventDefault(),d("#send-comment").disabled=!0,d("#comment-status").textContent="\u6B63\u5728\u4FDD\u5B58\u2026";try{let X=d("#comment-body").value,I=d("#comment-author").value,j=await D(d("#comment-image").files[0]);await Ze(B?{action:"edit",id:B,author:I,body:X,owner:ne,...j?{image:j}:{}}:{placeId:F||"campus",author:I,body:X,owner:ne,parentId:R,image:j}),B=null,Ve.hidden=!0,d("#send-comment").textContent="\u53D1\u5E03\u7559\u8A00",q.hidden=!0,pe.textContent="\u9884\u89C8\u7559\u8A00",_i("campus-nickname",I),_i("campus-draft-"+(F||"campus"),""),d("#comment-body").value="",d("#comment-image").value="",R=null,d("#comment-status").textContent="\u7559\u8A00\u5DF2\u53D1\u5E03",L=1,await $e()}catch(X){d("#comment-status").textContent=X.message+"\uFF0C\u6587\u5B57\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002"}finally{d("#send-comment").disabled=!1}},d("#all-comments").onclick=()=>{F="",L=1,R=null,Ee(),$e()},d("#comments-prev").onclick=()=>{L--,$e()},d("#comments-next").onclick=()=>{L++,$e()};let v=f.filter(N=>N.nearby);d("#place-data-date").textContent=`\u6821\u56ED ${f.length-v.length} \u6761\uFF1B\u5468\u8FB9 ${v.length} \u6761\u3002\u5730\u70B9\u8BB0\u5F55\u66F4\u65B0\u4E8E ${e.sourceTimestamp?.slice(0,10)||"\u672A\u77E5\u65E5\u671F"}${e.referenceCounts?`\uFF0C\u5DF2\u5408\u5E76\u6E90\u5730\u56FE ${e.referenceCounts.sourcePointRecords} \u6761\u6807\u6CE8\uFF0C\u8865\u5145 ${e.referenceCounts.added} \u5904\u5730\u70B9`:""}\u3002`;let O=We("a","","\u6D4F\u89C8\u6587\u5B57\u7248\u5730\u70B9\u76EE\u5F55 \u2197");O.hidden=!0,O.href="/campus-map/data/processed/campus-places.json",O.target="_blank",O.rel="noreferrer",d("#place-data-date").after(O);for(let[N,X]of[["/campus-map/viewer/privacy.html","\u9690\u79C1\u4E0E\u672C\u673A\u6570\u636E"],["/campus-map/data/processed/campus-places.json","\u6821\u56ED\u5730\u70B9\u6570\u636E JSON"],["/campus-map/data/processed/surroundings.json","\u5468\u8FB9\u5730\u56FE\u4E0E\u5730\u70B9 JSON"]]){let I=We("p"),j=We("a","",X);j.href=N,j.target="_blank",j.rel="noreferrer",I.append(j),O.after(I)}d("#refresh-places").onclick=async()=>{let N=d("#refresh-places");N.disabled=!0;try{let X=await fetch("/api/places-refresh",{method:"POST"}),I=await X.json();if(!X.ok)throw Error(I.error);Le(`\u5DF2\u66F4\u65B0 ${I.count} \u6761\u5730\u70B9\uFF0C\u5237\u65B0\u9875\u9762\u540E\u751F\u6548`),d("#place-data-date").textContent=`${I.count} \u6761\u8BB0\u5F55 \xB7 ${I.sourceTimestamp?.slice(0,10)} \xB7 \u5237\u65B0\u9875\u9762\u5E94\u7528`}catch{Le("\u66F4\u65B0\u5931\u8D25\uFF0C\u7EE7\u7EED\u4F7F\u7528\u5DF2\u4FDD\u5B58\u7684\u5730\u70B9\u6570\u636E")}finally{N.disabled=!1}};let J;d("#download-offline").onclick=async()=>{let N=d("#download-offline");N.disabled=!0;try{J??(J=await navigator.serviceWorker.register("/campus-map/viewer/offline-worker.js",{scope:"/"})),await navigator.serviceWorker.ready,await new Promise((X,I)=>{let j=new MessageChannel,ie=setTimeout(()=>I(Error("\u4E0B\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5")),9e4);j.port1.onmessage=se=>{se.data.error?(clearTimeout(ie),I(Error(se.data.error))):se.data.done?(clearTimeout(ie),X()):d("#offline-state").textContent=`\u79BB\u7EBF\u8D44\u6E90 ${se.data.complete} / ${se.data.total}`},J.active.postMessage({type:"download-campus"},[j.port2])}),d("#offline-state").textContent="\u79BB\u7EBF\u5730\u56FE\u5DF2\u4FDD\u5B58\uFF1A\u5EFA\u7B51\u3001\u5730\u70B9\u4E0E\u4E09\u6863\u6A21\u578B\u3002\u7559\u8A00\u9700\u8981\u8054\u7F51\u4F7F\u7528\u3002"}catch(X){d("#offline-state").textContent=X.message}finally{N.disabled=!1}};let ee;window.addEventListener("beforeinstallprompt",N=>{N.preventDefault(),ee=N,d("#install-campus").hidden=!1}),d("#install-campus").onclick=async()=>{await ee?.prompt(),d("#install-campus").hidden=!0};let W=We("button","","\u25CE");W.id="locate-user",W.title="\u6211\u7684\u4F4D\u7F6E",W.setAttribute("aria-label","\u6211\u7684\u4F4D\u7F6E");let _e=We("button","","\u2197");_e.id="share-view",_e.title="\u5206\u4EAB\u5F53\u524D\u89C6\u89D2",_e.setAttribute("aria-label","\u5206\u4EAB\u5F53\u524D\u89C6\u89D2"),_e.onclick=()=>ue();let oe=We("button","","\u26F6");oe.title="\u5168\u5C4F\u5730\u56FE",oe.setAttribute("aria-label","\u5168\u5C4F\u5730\u56FE"),oe.onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{Le("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5168\u5C4F")}},oe.id="fullscreen-map",sn(W,"location",""),sn(_e,"share",""),sn(oe,"fullscreen",""),d(".map-tools").append(W,_e,oe);function xe(){P!==null&&navigator.geolocation.clearWatch(P),P=null,A=null,S=null,W.classList.remove("active"),W.setAttribute("aria-pressed","false"),W.title="\u6211\u7684\u4F4D\u7F6E",window.removeEventListener("deviceorientationabsolute",ge),window.removeEventListener("deviceorientation",ge),b&&(b.visible=!1),u(),h()}function ge(N){let X=N.webkitCompassHeading??(N.absolute&&Number.isFinite(N.alpha)?360-N.alpha:null);X!==null&&(S=X,re())}function re(){!b||!A||(b.position.set(A[0],1,-A[1]),b.rotation.y=-(S??0)*Math.PI/180,b.getObjectByName("heading").visible=Number.isFinite(S),b.visible=!0,h())}W.onclick=async()=>{if(P!==null){xe(),Le("\u5DF2\u505C\u6B62\u5B9A\u4F4D");return}if(!navigator.geolocation){Le("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5B9A\u4F4D");return}W.title="\u6B63\u5728\u5B9A\u4F4D\u2026",W.setAttribute("aria-pressed","true"),W.disabled=!0;let N=!0;if(typeof DeviceOrientationEvent<"u"&&typeof DeviceOrientationEvent.requestPermission=="function")try{await DeviceOrientationEvent.requestPermission()==="granted"&&window.addEventListener("deviceorientation",ge)}catch{}else window.addEventListener("deviceorientationabsolute",ge);P=navigator.geolocation.watchPosition(X=>{let I=Si(X.coords.longitude,X.coords.latitude);if(Math.hypot(...I)>5e3){xe(),Le("\u5F53\u524D\u4F4D\u7F6E\u5728\u6821\u56ED\u8303\u56F4\u5916\uFF0C\u5730\u56FE\u7EE7\u7EED\u4FDD\u7559\u6821\u56ED\u89C6\u89D2");return}if(A=I,S=Number.isFinite(X.coords.heading)?X.coords.heading:S,!b){b=new Bt,b.name="Local GPS accuracy marker";let j=new it(new Ua(2,16,8),new Jt({color:2522093,depthTest:!1})),ie=new it(new Da(.97,1,64),new Jt({color:3770358,transparent:!0,opacity:.55,side:Mn,depthTest:!1}));ie.rotation.x=-Math.PI/2,ie.name="accuracy";let se=new it(new wa(2,5,3),new Jt({color:2522093,depthTest:!1}));se.name="heading",se.rotation.x=-Math.PI/2,se.position.z=-5,b.add(j,ie,se),b.renderOrder=10,s.add(b)}b.getObjectByName("accuracy").scale.setScalar(Math.min(300,Math.max(3,X.coords.accuracy))),re(),W.classList.add("active"),W.title=`\u6211\u7684\u4F4D\u7F6E \xB7 \u7CBE\u5EA6\u7EA6 ${Math.round(X.coords.accuracy)} \u7C73`,N&&(N=!1,a({centroid:I,phase:"all",labelHeight:0},500),Le(`\u5DF2\u5B9A\u4F4D\uFF0C\u8BEF\u5DEE\u7EA6 ${Math.round(X.coords.accuracy)} \u7C73`)),u()},X=>{xe(),Le({1:"\u672A\u83B7\u5B9A\u4F4D\u6743\u9650\uFF0C\u53EF\u5728\u6D4F\u89C8\u5668\u4E2D\u91CD\u65B0\u5141\u8BB8",2:"\u6682\u65F6\u65E0\u6CD5\u83B7\u53D6\u4F4D\u7F6E",3:"\u5B9A\u4F4D\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5"}[X.code]||"\u5B9A\u4F4D\u5931\u8D25")},{enableHighAccuracy:!0,timeout:15e3,maximumAge:5e3}),W.disabled=!1},window.addEventListener("pagehide",xe);function ve(){if(V)return;let N=l();_i("campus-view",N),history.replaceState(null,"",mo(N))}async function Ue({preserveCamera:N=!1}={}){new URLSearchParams(window.location.hash.slice(1)).get("panel")==="comments"&&dt("comments");let X=go(Te(),g);if(!X)try{let I=ki("campus-view",null);I&&(X=go(mo(I),g))}catch{}if(X){V=!0;try{if(X.place){let I=g.find(j=>j.id===X.place);I&&r(I,!X.target&&!N)}X.target&&X.position&&!N&&o(X)}finally{V=!1}}}function Te(){return window.location.hash}return window.addEventListener("hashchange",Ue),c(x),{addActions:ke,toast:Le,open:dt,share:ue,restore:Ue,saveView:ve,clearSelection:()=>T=null,get state(){return{placeCategories:w,favorites:p,location:A,labels:x.labels}},get layers(){return x},get current(){return T},get entries(){return g}}}var rg="20261016-depth2",jr=i=>i.toArray().map(e=>Math.round(e*1e4)).join(","),vb=new C(0,1,0),Yc=i=>{let e=i.geometry,t=e.attributes.position,n=e.index?.count??t.count,s=[];for(let r=0;r<n;r+=3){let a=[0,1,2].map(u=>e.index?e.index.getX(r+u):r+u),o=a.map(u=>new C().fromBufferAttribute(t,u).applyMatrix4(i.matrixWorld)),l=new C().crossVectors(o[1].clone().sub(o[0]),o[2].clone().sub(o[0])),c=l.length()*.5;c<1e-8||s.push({points:o,indices:a,normal:l.normalize(),area:c})}return s};function bb(i){let e=Yc(i),t=e.map((o,l)=>l),n=new Map,s=o=>t[o]===o?o:t[o]=s(t[o]);e.forEach((o,l)=>{for(let c=0;c<3;c++){let u=[jr(o.points[c]),jr(o.points[(c+1)%3])].sort().join("|");if(n.has(u)){let h=n.get(u);o.normal.dot(e[h].normal)>.9999&&(t[s(l)]=s(h))}else n.set(u,l)}});let r=new Map;e.forEach((o,l)=>{let c=s(l);r.has(c)||r.set(c,[]),r.get(c).push(o)});let a=[];for(let o of r.values()){let l=o[0].normal;if(Math.abs(l.y)>.015)continue;let c=new C(l.z,0,-l.x).normalize(),u=l.dot(o[0].points[0]),h=o.flatMap(x=>x.points),d=h.map(x=>x.dot(c)),f=h.map(x=>x.y),g=Math.min(...d),_=Math.max(...d),m=Math.min(...f),p=Math.max(...f),M=o.reduce((x,y)=>x+y.area,0);_-g<.3||p-m<.2||Math.abs(M-(_-g)*(p-m))>M*.001||h.some(x=>Math.abs(l.dot(x)-u)>.002)||a.push({normal:l,tangent:c,distance:u,left:g,right:_,bottom:m,top:p,triangles:o})}return a}function _o(){let i=[],e=(r,a,o)=>i.push(...r.toArray(),...a.toArray(),...o.toArray()),t=(r,a,o,l)=>{e(r,a,o),e(r,o,l)};function n(r,a,o,l,c,u,h,d=.008){if(o-a<=0||c-l<=0)return;let f=Math.min(d,(o-a)*.22,(c-l)*.22,(h-u)*.3),g=(x,y,w)=>r.tangent.clone().multiplyScalar(x).addScaledVector(vb,y).addScaledVector(r.normal,r.distance+w),_=(x,y)=>[[a+x,l+x],[o-x,l+x],[o-x,c-x],[a+x,c-x]].map(([w,T])=>g(w,T,y)),m=_(0,u),p=_(0,h-f),M=_(f,h);t(M[0],M[1],M[2],M[3]),t(m[3],m[2],m[1],m[0]);for(let x=0;x<4;x++){let y=(x+1)%4;t(m[x],m[y],p[y],p[x]),t(p[x],p[y],M[y],M[x])}}function s(){let r=new gt;return r.setAttribute("position",new ut(i,3)),r.computeVertexNormals(),r.computeBoundingBox(),r.computeBoundingSphere(),r}return{tri:e,quad:t,bar:n,geometry:s,get triangles(){return i.length/9}}}function ag(i,e){if(i.userData.photoArchitecture)return i.userData.photoArchitecture;let t={version:rg,lod:e,windowBands:0,mullions:0,extrudedMeshes:0,roofEdges:0,depthGlazing:0,windowReveals:0,roofAssemblies:0,addedTriangles:0,addedMeshes:0};if(e===2)return i.userData.photoArchitecture=t,t;i.updateMatrixWorld(!0);let n=new Bt;n.name="Photo referenced architectural finishes",n.matrix.copy(i.matrixWorld).invert(),n.matrixAutoUpdate=!1;let s=new Wt({name:"Photo detail aluminum mullion - section estimate",color:5466994,roughness:.32,metalness:.65}),r=new Wt({name:"Photo detail roof edge stone - section estimate",color:13488325,roughness:.74}),a=new Map;function o(l,c,u,h){if(!l.triangles)return;let d=new it(l.geometry(),c);d.name=h,d.userData={...u,kind:"building_detail",photo_finish:rg,detail_status:"photo_estimated",detail_role:h,source_pages:[h.startsWith("Library")?"https://www.bnbu.edu.cn/en/info/1058/11125.htm":"https://www.bnbu.edu.cn/en/info/1058/11128.htm"],dimension_status:"Sections, pitch and finish are visual estimates on existing registered geometry."},n.add(d),t.addedMeshes++,t.addedTriangles+=l.triangles}return i.traverse(l=>{if(!l.isMesh||Array.isArray(l.material))return;let c=l.material.name,u=as(l);if(c==="Photo-observed glazing bands - opaque approximation"||/^Library (crown edge\d|podium) glass/.test(c)){let g=bb(l);if(!g.length)return;let _=l.geometry.clone(),m=new Float32Array(_.attributes.position.count*2),p=new Float32Array(_.attributes.position.count*4),M=_o(),x=_o();for(let y of g){let w=c.startsWith("Photo-observed"),T=y.right-y.left,P=y.top-y.bottom,A=c.includes("podium"),S=w?Math.max(1,Math.round(T/.78)):A?Math.max(1,Math.round(T/1.6)):e===0?24:12,b=w?P>2?2:1:A?1:e===0?4:2;for(let L of y.triangles)for(let F=0;F<3;F++){let z=L.points[F],V=L.indices[F],B=z.dot(y.tangent)-y.left;m[V*2]=B/T*S,m[V*2+1]=(z.y-y.bottom)/P*b,p.set([B,z.y-.35,w?4.68:10.2,3.8],V*4)}if(t.depthGlazing++,!w)continue;t.windowBands++;let R=e===0?.042:.055;M.bar(y,y.left,y.right,y.bottom,y.bottom+R,.005,.1),M.bar(y,y.left,y.right,y.top-R,y.top,.005,.1);for(let L of[y.left,y.right-R])M.bar(y,L,L+R,y.bottom,y.top,.005,.1);if(e===0)for(let L=1;L<S;L++){let F=y.left+T*L/S;M.bar(y,F-R/2,F+R/2,y.bottom,y.top,.008,.095),t.mullions++}e===0&&b===2&&M.bar(y,y.left,y.right,y.bottom+P*.55-.02,y.bottom+P*.55+.02,.008,.095),x.bar(y,y.left-.08,y.right+.08,y.top,y.top+.14,-.015,.32,.012),x.bar(y,y.left-.075,y.left,y.bottom,y.top,-.015,.22,.006),x.bar(y,y.right,y.right+.075,y.bottom,y.top,-.015,.22,.006),t.windowReveals++}if(_.setAttribute("campusPaneUv",new ct(m,2)),_.setAttribute("campusInterior",new ct(p,4)),l.geometry=_,!a.has(l.material)){let y=l.material.clone();y.userData={...y.userData,registeredPaneUv:!0,interiorDepthProxy:!0},a.set(l.material,y)}l.material=a.get(l.material),o(M,s,u,"Window band jambs, headers and narrow mullions"),o(x,r,u,"Teaching window heads and recessed jamb returns")}if(c==="Photo-observed circular skylight - flat coverage estimate"&&u.building_id==="way/1215983507"){let g=Yc(l),_=g.flatMap(S=>S.points),m=new Gt().setFromPoints(_),p=m.getCenter(new C),M=(m.max.x-m.min.x)/2,x=l.geometry.clone(),y=new Float32Array(x.attributes.position.count*4),w=new Float32Array(x.attributes.position.count*2),T=_o();for(let S of g)for(let b=0;b<3;b++){let R=S.points[b],L=S.indices[b];y.set([R.x-p.x+M,p.z-R.z+M,2*M,2*M],L*4),w.set([(R.x-p.x)/1.5,(R.z-p.z)/1.5],L*2)}let P=e===0?48:24,A=(S,b,R)=>new C(p.x+S*Math.cos(b),R,p.z+S*Math.sin(b));for(let S=0;S<P;S++){let b=S/P*Math.PI*2,R=(S+1)/P*Math.PI*2,L=p.y+.19;T.quad(A(M,b,L),A(M,R,L),A(M+.22,R,L),A(M+.22,b,L)),T.quad(A(M,b,p.y),A(M,R,p.y),A(M,R,L),A(M,b,L)),T.quad(A(M+.22,R,p.y),A(M+.22,b,p.y),A(M+.22,b,L),A(M+.22,R,L))}x.setAttribute("campusInterior",new ct(y,4)),x.setAttribute("campusPaneUv",new ct(w,2)),l.geometry=x,l.material=l.material.clone(),l.material.userData={...l.material.userData,registeredPaneUv:!0,interiorDepthProxy:!0,skylightDepthProxy:!0},o(T,r,u,"Library circular skylight curb"),t.roofAssemblies++,t.depthGlazing++}if(c==="Photo-observed PV coverage - module count unresolved"){let g=_o(),_=new Map;for(let m of Yc(l))for(let p=0;p<3;p++){let M=m.points[p],x=m.points[(p+1)%3],y=[jr(M),jr(x)].sort().join("|");_.has(y)?_.delete(y):_.set(y,{a:M,c:x})}for(let{a:m,c:p}of _.values()){let M=p.clone().sub(m).normalize(),x=new C(-M.z,0,M.x),y={tangent:M,normal:x,distance:m.dot(x)},w=m.dot(M),T=p.dot(M);g.bar(y,Math.min(w,T),Math.max(w,T),m.y-.12,m.y+.035,-.035,.035,.005)}o(g,s,u,"Teaching PV perimeter frame and support edge"),t.roofAssemblies++}let h=/^Library (crown edge\d|podium) mullion/.test(c),d=/^Library podium fascia/.test(c),f=/^Photo-estimated pale facade edges$/.test(c)&&["way/664082910","way/664082908","way/664082909"].includes(u.id||u.building_id);if(h&&e===0||d||f){let g=_o(),_=new Map,m=h?.075:d?.1:.08;for(let p of Yc(l)){if(Math.abs(p.normal.y)>.02||f&&Math.min(...p.points.map(x=>x.y))<20)continue;let M=p.points.map(x=>x.clone().addScaledVector(p.normal,m));g.tri(...M);for(let x=0;x<3;x++){let y=p.points[x],w=p.points[(x+1)%3],T=[jr(y),jr(w)].sort().join("|");_.has(T)?_.delete(T):_.set(T,{a:y,c:w,normal:p.normal})}}for(let{a:p,c:M,normal:x}of _.values())g.quad(p,M,M.clone().addScaledVector(x,m),p.clone().addScaledVector(x,m));g.triangles&&(t.extrudedMeshes++,f&&t.roofEdges++,o(g,h?s:r,u,h?"Library mullion returns":d?"Library fascia returns":"Teaching roof coping returns"))}}),i.add(n),i.userData.photoArchitecture=t,t}function og(i,e,t=[]){let n=new Set(t.map(r=>r.id)),s=nf({elements:i.poiElements},e).filter(r=>!n.has(r.id)).map(r=>({...r,phase:"nearby",nearby:!0,sourceTimestamp:i.sourceTimestamp,labelHeight:2}));s.forEach(r=>n.add(r.id));for(let r of i.roads){let a=r.source_url.replace("https://www.openstreetmap.org/","");n.has(a)||(n.add(a),s.push({id:a,kind:"poi",name:r.name,name_en:"",phase:"nearby",nearby:!0,road:!0,category:"transport",centroid:r.point,labelHeight:1,floor:"",tags:{name:r.name,highway:"road"},source_url:r.source_url,sourceTimestamp:i.sourceTimestamp}))}return s}function lg(i){let e=new Bt;e.name="OSM surrounding map in campus ENU";let t={land:["#b8b9a6",-.05,"ground"],green:["#78936c",-.035,"green"],water:["#638a8c",-.02,"water"],roads:["#d6d3bf",-.005,"roads"],paths:["#bcbba7",.008,"roads"],buildings:["#84928b",.025,"buildings"]},n=0;for(let[s,[r,a,o]]of Object.entries(t)){let l=i.layers[s].map(h=>{let d=new Cr(h.outer.map(f=>new he(...f)));for(let f of h.holes)d.holes.push(new Is(f.map(g=>new he(...g))));return new La(d).rotateX(-Math.PI/2).translate(0,a,0)});if(!l.length)continue;let c=Lc(l,!1);l.forEach(h=>h.dispose());let u=new it(c,new Jt({color:r,toneMapped:!1}));u.name="Surrounding "+s,u.userData={contextLayer:o,source:i.source,geometryStatus:"OSM footprint; cartographic road widths"},u.receiveShadow=!0,c.computeBoundingBox(),c.computeBoundingSphere(),e.add(u),n+=c.index.count/3}return{group:e,update(s,r){e.visible=s,e.children.forEach(a=>a.visible=r[a.userData.contextLayer]!==!1)},diagnostics:{sourceTimestamp:i.sourceTimestamp,counts:i.counts,triangles:n,drawBatches:e.children.length,bounds:i.bounds,externalRequestsDuringNavigation:0}}}function cg({width:i,height:e,coarse:t=!1,memory:n,saveData:s=!1}={}){let a=Math.min(i||1/0,e||1/0)<=600||i<=760||t||n>0&&n<=4||s;return{lightweight:a,quality:a?"balanced":"high",mobileTextures:a,loadEnvironment:!s}}var ug={bounds:[-563.5550514865866,-903.9100684978015,685.774100157334,1411.2004056615885],stats:{buildings:79,by_phase:{"1":42,"2":37},height_status:{estimated:45,unknown:13,mixed:7,mapped:14},construction:4,courtyard_rings:10,surfaces:449,mapped_tree_nodes:4,excluded_underground:3,photo_detailed_buildings:38,photo_detailed_surfaces:1,source_building_parts:101,buildings_with_parts:18,elevated_parts:12,uncertain_volume_markers:1},buildings:[{id:"way/1081327620",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[.2678,-532.6801],[-7.7768,-543.6761],[37.9779,-579.6761],[45.5281,-569.6767]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/1201625876",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[294.575,-676.7437],[289.1776,-682.3248],[304.3197,-696.8308],[309.7274,-691.2607]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1201625882",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[499.0864,-493.3833],[494.194,-502.8181],[515.7326,-514.8764],[520.5735,-504.7883]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1201625883",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[482.5852,-496.4733],[492.6695,-501.9655],[521.2615,-443.0424],[508.6948,-435.7675]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1202303549",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[38.4518,-607.0941],[27.8526,-618.4776],[50.0708,-638.875],[58.9086,-625.177]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1206553328",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-14.5132,-380.9066],[-13.0609,-392.7774],[42.8186,-387.0745],[40.7997,-374.0299]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1206553329",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[59.9995,-384.4611],[59.567,-406.7632],[65.9223,-405.7333],[65.8707,-383.5641]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1215697328",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[578.5067,-600.9929],[568.1139,-610.9705],[559.7186,-602.3113],[550.6545,-610.8825],[564.3649,-623.6277],[570.2155,-618.7994],[575.9634,-625.0557],[581.3813,-620.2275],[574.8608,-613.8494],[582.9258,-605.7211]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1215983507",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[280.1231,-662.0494],[295.1203,-643.9328],[315.9064,-627.8205],[343.4184,-594.0568],[331.5932,-583.3379],[269.934,-558.778],[267.4105,-565.1232],[261.076,-581.1024],[248.8393,-594.9998],[246.429,-597.735],[229.0009,-618.6974]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664082908",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[158.3395,-624.9549],[156.712,-624.6891],[155.6099,-631.2779],[158.0202,-631.6211],[156.8563,-639.4501],[195.7924,-644.9421],[218.9583,-648.2196],[224.4485,-648.9946],[226.8897,-649.3379],[227.8579,-641.9297],[229.238,-635.6067],[214.4567,-630.5242],[214.6627,-627.9883],[187.4178,-623.7697],[190.2502,-608.466],[183.5549,-606.5726],[164.3341,-601.1468],[164.0663,-603.0735],[161.1925,-602.7746]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082909",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[127.3036,-576.3314],[124.5225,-575.6559],[122.5551,-582.5104],[125.2539,-583.2745],[123.4513,-589.5975],[164.3341,-601.1468],[183.5549,-606.5726],[190.2502,-608.466],[193.0314,-609.2522],[195.112,-601.9658],[196.9866,-596.9495],[182.8234,-589.6633],[183.7195,-586.8506],[148.811,-577.4718],[151.9114,-566.6418],[131.7121,-560.9281]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082910",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[202.0348,-672.4929],[201.8907,-677.4981],[204.507,-677.3652],[204.9913,-684.7069],[237.4277,-682.0156],[237.5,-697.1974],[244.9577,-702.7119],[264.7447,-680.2434],[263.9822,-665.1392],[255.9684,-665.1393],[255.8344,-663.6997],[241.1871,-664.309],[222.7182,-665.627],[224.4485,-648.9946],[218.9583,-648.2196],[195.7924,-644.9421],[193.7119,-661.2091],[193.9695,-670.688]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082911",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[319.0298,-740.5487],[331.2259,-751.8434],[342.4327,-739.4298],[351.1884,-747.1035],[346.7489,-751.9095],[353.9904,-758.2766],[355.6385,-756.5491],[359.3673,-759.7714],[380.1637,-736.6273],[348.4578,-707.992]],holes:[]}],base_elevation_m:0,height_m:7.6},{id:"way/664082912",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[287.9128,-800.0362],[295.1337,-806.6358],[289.314,-812.9257],[296.8645,-819.8244],[353.9904,-758.2766],[346.7489,-751.9095],[351.1884,-747.1035],[342.4327,-739.4298],[331.2259,-751.8434],[325.2517,-758.4655],[300.3866,-786.0722]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082913",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[246.3701,-783.8142],[275.2432,-807.3006],[297.2037,-783.4036],[300.3866,-786.0722],[325.2517,-758.4655],[296.1005,-729.83]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/664082915",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[125.5433,-703.112],[147.5042,-722.9776],[192.1989,-763.4065],[226.8187,-725.5789],[160.1734,-665.2735]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/664093255",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[399.5947,-495.0251],[397.8849,-500.0193],[393.2703,-499.9862],[393.6005,-522.0889],[396.2477,-522.0777],[396.001,-541.2238],[400.7494,-535.8198],[400.3781,-518.3901],[396.3918,-518.4235],[396.3608,-514.0937],[409.7412,-517.4597],[415.2211,-518.8327],[424.3578,-526.7722],[427.139,-529.1861],[426.5108,-535.0661],[432.9796,-538.078],[437.6766,-540.0821],[438.1298,-540.1818],[440.8904,-540.7797],[443.9702,-539.0078],[445.8552,-540.7795],[449.0072,-541.5435],[451.4072,-541.0894],[466.9297,-532.3963],[468.2996,-531.0785],[468.7219,-529.3621],[468.5776,-526.184],[473.8308,-525.9734],[473.4595,-511.5447],[470.0089,-511.6223],[470.0704,-503.4722],[429.9605,-502.8643],[414.654,-498.9115]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664093256",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[387.5755,-550.8137],[365.2025,-535.6657],[356.1898,-543.3841],[362.0818,-547.4369],[358.8681,-551.5342],[371.4658,-562.3416],[376.0288,-557.0373],[379.8091,-559.6395],[363.1125,-578.642],[372.4965,-586.7919],[424.3578,-526.7722],[415.2211,-518.8327],[400.7494,-535.8198],[396.001,-541.2238]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093257",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[355.0049,-526.9289],[358.0531,-495.1036],[340.6968,-492.9114],[335.0121,-544.0379],[333.9305,-544.9571],[316.6769,-524.6486],[307.6126,-529.2443],[311.4959,-533.9726],[302.8643,-540.4286],[314.329,-554.7132],[323.1048,-547.1609],[326.741,-551.1141],[312.5266,-563.2731],[321.2204,-573.3055],[356.1898,-543.3841],[365.2025,-535.6657],[378.2735,-524.4922],[369.59,-514.4598]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093258",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[256.4607,-539.1006],[262.9914,-551.8572],[307.6126,-529.2443],[316.6769,-524.6486],[327.4407,-519.1891],[320.91,-506.4437],[307.1281,-513.4203],[313.6683,-483.0898],[296.7034,-478.1071],[284.8794,-524.6935],[277.0923,-528.6469],[263.2584,-504.828],[251.4233,-507.4969],[254.9976,-513.0226],[245.8097,-515.6361],[254.1533,-531.1278],[263.8047,-527.0636],[267.5748,-533.464]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093260",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[255.6256,-492.7913],[270.0251,-466.4471],[254.3169,-456.7581],[230.4824,-498.4724],[225.188,-499.6684],[218.0906,-475.4064],[208.8923,-475.1186],[209.5516,-477.3223],[198.8495,-478.009],[202.9184,-499.7794],[214.8051,-497.2324],[216.0515,-501.7282],[201.1674,-505.0947],[204.1547,-518.1725],[251.4233,-507.4969],[263.2584,-504.828],[279.4712,-501.1624],[276.4736,-488.0847]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093261",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[150.592,-474.7871],[208.8923,-475.1186],[218.0906,-475.4064],[221.3352,-475.4396],[221.5512,-452.5396],[150.8081,-451.8871]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664093272",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[42.6337,-585.0578],[70.3627,-608.7107],[50.8228,-643.1161],[61.9886,-652.9272],[82.4659,-618.0345],[90.871,-608.1015],[51.8732,-574.2389]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093273",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-57.0747,-501.9289],[-18.0052,-535.7253],[-9.0232,-525.0505],[-36.8858,-500.7662],[-16.8309,-466.5824],[-28.1613,-459.1963],[-48.2884,-492.2175]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093274",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-70.898,-531.473],[-38.668,-561.0172],[-28.8619,-550.4309],[-61.0816,-520.8978]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664093275",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[15.4507,-516.3578],[54.5203,-550.154],[63.5126,-539.4681],[61.6276,-537.8292],[35.6395,-515.195],[52.0995,-484.311],[40.769,-476.925],[27.9657,-501.5636]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093276",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[118.6406,-528.9701],[106.6096,-521.9385],[95.073,-511.8838],[77.2532,-497.2004],[67.3236,-509.4256],[80.0138,-522.1047],[94.2079,-538.1834],[77.099,-565.9891],[89.4699,-574.7149],[95.815,-564.6601]],holes:[]}],base_elevation_m:0,height_m:25.6},{id:"way/664093277",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[90.7357,-364.0636],[78.4989,-368.2716],[40.7997,-374.0299],[42.8186,-387.0745],[59.9995,-384.4611],[65.8707,-383.5641],[81.1874,-381.2276],[93.6819,-416.4302],[107.608,-411.5356]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093278",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[17.1501,-428.9767],[29.4797,-425.0345],[71.1756,-419.0326],[69.4554,-405.1575],[65.9223,-405.7333],[59.567,-406.7632],[27.09,-412.0342],[15.3887,-376.5547],[1.3596,-381.1392]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093279",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[31.7562,-467.3021],[42.8188,-473.16],[40.769,-476.925],[27.9657,-501.5636],[15.4507,-516.3578],[54.5203,-550.154],[63.5126,-539.4681],[61.6276,-537.8292],[80.0138,-522.1047],[94.2079,-538.1834],[77.099,-565.9891],[89.4699,-574.7149],[95.815,-564.6601],[107.0425,-568.5579],[117.5899,-534.3407],[118.6406,-528.9701],[118.6199,-524.0866],[115.344,-472.5173],[114.396,-428.478],[114.3136,-425.7871],[74.7911,-431.0584],[65.0676,-442.5638],[62.0186,-439.9505],[59.8144,-442.3202],[63.8109,-446.2956],[63.0384,-447.1372],[38.369,-445.0997]],holes:[]}],base_elevation_m:0,display_height_m:.18,height_m:7.6},{id:"way/664093280",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[201.5167,-431.9985],[252.2255,-432.0088],[252.2246,-380.0187],[236.084,-380.019],[236.0841,-389.221],[236.0739,-393.7723],[236.0742,-416.5615],[201.5165,-416.551]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093281",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[248.7939,-334.8167],[198.0751,-334.8949],[198.1685,-385.6116],[214.3194,-385.5893],[214.3091,-381.3259],[214.2571,-350.3201],[248.8147,-350.2532]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093282",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[214.3091,-381.3259],[214.3194,-385.5893],[236.0739,-393.7723],[236.0841,-389.221]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/664093283",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[180.2452,-332.1379],[126.0245,-348.0067],[125.4377,-392.8102],[140.5793,-393.0093],[140.6307,-389.1336],[140.641,-384.8814],[140.4348,-359.7888],[178.8755,-348.5377],[176.9905,-342.1705],[182.7174,-340.4983]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093284",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[140.641,-384.8814],[140.6307,-389.1336],[161.4478,-396.8849],[161.4478,-392.3337]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/664093285",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[126.8801,-435.1109],[177.5889,-435.1215],[177.5986,-383.1314],[161.4477,-383.1316],[161.4478,-392.3337],[161.4478,-396.8849],[161.4378,-419.6741],[126.88,-419.6634]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093286",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[276.1638,-445.3188],[328.1811,-460.4442],[346.7307,-397.4023],[330.5281,-392.6964],[316.6545,-439.8477],[295.518,-433.7023],[299.4525,-420.2922],[284.7744,-416.0292]],holes:[]}],base_elevation_m:0,height_m:25.6},{id:"way/664093287",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[271.1875,-377.4161],[324.4819,-394.1472],[329.3433,-378.8324],[287.3486,-365.6558],[287.5231,-334.1627],[271.4134,-334.0744]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093288",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[373.5238,-474.5176],[427.3439,-489.2661],[444.6777,-426.7335],[429.124,-422.4707],[416.1365,-469.3452],[392.8059,-462.9453],[396.8845,-448.2063],[381.9488,-444.1206]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093289",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[358.4946,-437.322],[371.4938,-441.1199],[380.7428,-409.7485],[418.4527,-420.7324],[422.9948,-405.318],[372.2857,-390.5472]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093290",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[448.0954,-712.3524],[461.2186,-724.4553],[479.8518,-704.4671],[477.3177,-702.1196],[501.4922,-673.5049],[539.6654,-653.3166],[534.113,-643.3506],[494.9922,-660.0508],[467.2744,-692.8735],[451.2669,-678.1905],[432.6647,-698.2562],[435.621,-700.9802],[404.8428,-694.1376],[401.4436,-693.728],[398.1886,-694.1267],[395.7474,-695.8321],[374.8997,-719.6628],[385.7258,-729.7505],[403.9779,-709.4855],[405.3994,-709.0426],[402.6084,-727.3582],[428.9266,-733.7469],[433.0566,-715.1876],[446.8697,-717.9999]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/664093294",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[79.4366,-434.9341],[102.6227,-434.5574],[103.4058,-472.6171],[115.344,-472.5173],[114.396,-428.478],[114.3136,-425.7871],[74.7911,-431.0584],[65.0676,-442.5638],[77.7371,-453.1611],[87.4709,-441.6446]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"relation/16121437",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-119.366,240.2847],[-123.6198,250.7049],[-125.7621,249.8855],[-160.8947,295.0436],[-167.5588,289.9941],[-167.188,289.4515],[-168.7021,288.1781],[-169.2686,288.8868],[-177.4672,298.9859],[-189.4049,292.2977],[-203.0008,288.2671],[-201.25,275.2335],[-201.1573,274.5359],[-203.1349,274.2037],[-203.1864,274.8238],[-211.622,273.8938],[-203.6403,217.0865],[-206.0299,216.4],[-201.426,205.9022],[-183.6173,213.3434],[-172.2976,218.0495],[-136.8244,232.788],[-131.6641,234.9252],[-130.0574,232.9984]],holes:[[[-176.1593,283.4276],[-150.7807,250.694],[-149.658,248.125],[-179.7133,235.7562],[-185.1414,233.5305],[-185.6976,233.2979],[-186.9233,235.6566],[-192.4539,276.5512],[-192.5775,277.4592],[-184.1006,280.2939],[-176.6228,284.0145]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121438",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-274.6275,225.5921],[-259.4661,213.6213],[-252.2869,222.7126],[-254.3778,224.1632],[-231.3669,276.5738],[-239.1124,279.8517],[-239.2978,279.3866],[-241.2239,280.2061],[-240.9355,280.8927],[-235.8471,293.0181],[-242.748,296.8275],[-251.2041,303.1063],[-257.4664,309.972],[-268.1681,302.0878],[-268.8067,301.6117],[-270.2898,303.2838],[-269.4143,303.9039],[-274.4303,310.4595],[-320.5745,276.2654],[-322.2945,277.716],[-329.2781,269.0345],[-321.1928,258.7249],[-318.8753,260.5299],[-314.5803,257.1302],[-284.2578,233.1998]],holes:[[[-248.99,284.1373],[-265.3881,246.5541],[-267.3554,244.273],[-267.8086,244.6163],[-272.4744,248.3038],[-297.853,268.3584],[-296.1638,270.6949],[-263.1212,295.2111],[-262.1942,295.7869],[-255.6436,289.9843],[-248.6089,285.0232]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121439",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-149.213,464.5347],[-164.2197,476.3171],[-171.3472,467.4473],[-169.38,465.9745],[-192.3492,413.597],[-184.5625,410.3856],[-184.3668,410.8507],[-182.4717,410.0977],[-182.7292,409.4665],[-187.9204,397.6732],[-175.5092,389.4676],[-166.2498,380.2322],[-155.61,388.1275],[-155.1671,388.4486],[-153.8899,386.8097],[-154.3534,386.4443],[-149.0284,379.5455],[-102.9673,413.6958],[-101.4429,412.4224],[-94.4081,421.1593],[-96.6844,423.4405],[-102.6891,431.4577],[-105.0375,429.83],[-109.2089,433.1077],[-139.5519,456.9382]],holes:[[[-174.8293,406.244],[-158.4933,443.7498],[-156.5055,445.7984],[-156.042,445.444],[-151.4895,441.9226],[-126.0079,422.2005],[-127.3469,419.8307],[-160.8113,395.0817],[-161.522,394.5613],[-167.846,400.3307],[-175.2722,405.2252]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121440",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-146.7734,316.8472],[-149.987,309.1401],[-108.7464,291.8982],[-109.1481,289.8275],[-97.7049,288.0003],[-97.2826,290.9901],[-93.1626,300.314],[-95.7478,301.3328],[-94.965,306.9581],[-90.7007,338.6394],[-89.1041,350.7539],[-86.5908,369.8003],[-97.9928,371.3396],[-98.3636,368.5712],[-142.8178,363.3116],[-141.5716,354.9622],[-140.7476,355.084],[-140.2944,352.8361],[-141.3759,352.7143],[-154.6215,351.2638],[-154.5496,339.1383],[-158.4328,323.6575],[-146.0112,318.8626],[-145.2696,318.5525],[-146.0936,316.5703]],holes:[[[-141.8396,335.6611],[-141.2524,343.9219],[-140.4078,344.0326],[-111.0531,347.8417],[-108.8902,347.2658],[-109.6833,341.1865],[-113.0413,315.6177],[-115.8943,315.7064],[-142.6533,326.8908],[-143.5391,327.212]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16123936",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-302.3505,450.8279],[-304.668,449.8978],[-304.4105,449.2002],[-304.8946,448.8569],[-303.4218,447.1958],[-300.1054,439.3557],[-298.0042,440.2969],[-262.9239,395.2271],[-256.1671,400.1879],[-256.5585,400.9298],[-254.8281,402.1479],[-254.447,401.6496],[-246.4751,391.041],[-234.1564,398.1168],[-220.9622,401.7487],[-222.7336,414.6605],[-222.8366,415.4024],[-220.6839,415.6681],[-220.6428,415.1034],[-212.1557,416.3435],[-220.1063,472.9072],[-217.9331,473.9702],[-222.0528,484.4347],[-240.0673,476.8828],[-251.0984,472.2654],[-287.22,457.1285],[-292.1125,455.08],[-293.884,457.3279]],holes:[[[-247.7211,406.7322],[-272.9963,439.2223],[-274.1086,442.0904],[-243.724,454.5698],[-238.502,456.7179],[-237.9973,456.9283],[-236.9262,454.0492],[-231.1383,413.664],[-231.0765,413.1989],[-239.2958,410.1095],[-247.1752,406.0346]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16123937",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-337.0327,323.1621],[-337.4139,320.5487],[-325.8574,318.8764],[-325.6411,321.3347],[-281.0837,326.6934],[-282.1135,335.209],[-283.1023,335.0761],[-283.3701,337.3351],[-282.3092,337.479],[-269.0532,338.9626],[-269.4445,346.0719],[-268.3216,356.492],[-265.5199,366.2256],[-277.7251,371.4636],[-278.5285,371.7958],[-277.6736,373.7004],[-276.8084,373.4125],[-273.7904,381.1861],[-315.216,398.4726],[-315.0821,400.787],[-325.9072,402.1049],[-328.5855,383.1582],[-330.275,371.1435],[-334.7767,339.3404],[-335.539,333.9255],[-338.1552,333.7594]],holes:[[[-311.9006,342.4295],[-314.7228,342.961],[-311.3439,368.4301],[-310.5198,374.6866],[-307.8109,374.4429],[-281.2375,363.5018],[-280.2797,363.1031],[-282.0514,354.6983],[-282.5253,346.205],[-283.5656,346.0721]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/18706867",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-248.8986,198.6387],[-247.8069,195.0066],[-245.8191,191.5848],[-243.0793,188.7167],[-239.7319,186.5795],[-235.9621,185.2838],[-232.0069,184.9073],[-228.062,185.483],[-224.3746,186.9558],[-221.1301,189.2479],[-218.349,192.5257],[-216.495,196.3903],[-215.7018,200.5982],[-216.0005,204.8726],[-217.4012,208.9255],[-219.7907,212.4912],[-222.2936,214.6949],[-223.0146,215.3372],[-226.8564,217.264],[-231.0794,218.15],[-234.8904,218.0282],[-238.5778,217.0427],[-241.9356,215.2489],[-244.8093,212.7463],[-247.0342,209.6679],[-248.5071,206.1687],[-249.1355,202.4258]],holes:[[[-242.1317,192.3599],[-244.2225,195.1173],[-245.6026,198.5833],[-245.9734,202.2929],[-245.3141,205.9693],[-243.6558,209.3135],[-241.1529,212.0818],[-237.9701,214.0529],[-234.3651,215.0937],[-230.616,215.1047],[-227.3406,214.241],[-224.3948,212.591],[-221.9435,210.2655],[-220.141,207.3974],[-219.1214,204.1861],[-218.936,200.8197],[-219.5953,197.5198],[-221.0579,194.4746],[-223.2312,191.8945],[-226.0637,189.8903],[-229.3186,188.6612],[-232.7793,188.2958],[-236.2195,188.8274],[-239.4022,190.2116]]]}],base_elevation_m:0,height_m:.18},{id:"relation/19666480",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-278.0558,314.7893],[-272.6176,303.7268],[-267.2515,296.1967],[-260.9378,289.4085],[-253.8103,283.4841],[-245.9722,278.5341],[-237.5572,274.6139],[-228.7096,271.8233],[-221.407,270.2396],[-217.6166,270.0624],[-213.6306,269.8741],[-210.2831,269.719],[-201.0235,270.4498],[-191.9492,272.3654],[-183.1737,275.4326],[-174.8925,279.5962],[-167.2087,284.7896],[-154.6015,297.1696],[-149.1734,305.3308],[-145.1563,313.3369],[-142.1796,321.7749],[-140.2843,330.5229],[-139.5014,339.4371],[-139.8413,348.3734],[-141.3038,357.199],[-145.1661,368.5494],[-152.0772,381.6495],[-157.6184,388.6923],[-164.0146,394.9932],[-171.1317,400.4525],[-178.8874,404.9927],[-187.1581,408.5142],[-194.5946,410.3414],[-199.1883,411.3381],[-204.5442,412.368],[-213.3917,412.6782],[-222.2084,411.881],[-230.8706,410.0208],[-239.2341,407.1197],[-247.165,403.2108],[-254.55,398.3718],[-261.2965,392.658],[-267.2808,386.1801],[-268.0224,385.3053],[-272.4103,379.0045],[-276.6231,371.2642],[-279.8471,363.0588],[-282.0205,354.5322],[-283.1433,345.7953],[-283.1641,336.9918],[-282.1034,328.2548],[-279.9611,319.706]],holes:[[[-260.4328,302.9736],[-265.2325,309.7063],[-270.0939,319.5951],[-271.7933,323.9913],[-273.7089,331.6321],[-274.6564,339.45],[-274.6356,347.3122],[-273.6364,355.119],[-271.6896,362.7486],[-268.8158,370.0792],[-265.0459,377.0001],[-261.1319,382.6254],[-260.4624,383.4005],[-255.1167,389.203],[-249.0912,394.3078],[-242.4786,398.6374],[-235.3923,402.1254],[-227.9146,404.7165],[-220.1794,406.3775],[-212.2897,407.086],[-204.3897,406.8202],[-197.355,405.458],[-188.8474,403.365],[-181.4624,400.2201],[-174.5204,396.1671],[-168.1654,391.2836],[-162.4491,385.6471],[-157.4949,379.3573],[-151.3254,367.6415],[-147.8648,357.4981],[-146.5568,349.6137],[-146.2478,341.6297],[-146.9586,333.6568],[-148.6479,325.8389],[-151.3156,318.2979],[-154.9,311.1444],[-159.7514,303.847],[-171.0196,292.7847],[-177.8897,288.145],[-185.2953,284.4243],[-193.1233,281.6893],[-201.2499,279.973],[-209.5208,279.3087],[-219.4602,279.785],[-225.98,281.1914],[-233.9006,283.6942],[-241.4195,287.1935],[-248.4233,291.623],[-254.7989,296.9163]]]}],base_elevation_m:0,height_m:.18},{id:"relation/19971851",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-444.9095,110.1989],[-456.5904,87.5761],[-460.381,80.2455],[-458.9596,79.5478],[-462.8533,71.9183],[-464.3159,72.771],[-468.0859,65.4958],[-485.8958,31.1131],[-486.9772,31.6779],[-490.1499,25.5765],[-481.7245,21.1911],[-483.249,18.3342],[-479.5411,16.3298],[-476.6878,22.0879],[-467.4178,17.3814],[-470.2402,11.9554],[-470.642,10.981],[-470.4566,9.7961],[-465.3582,3.7277],[-463.5248,2.6092],[-462.0004,2.5095],[-460.2082,2.6977],[-458.6735,3.7053],[-457.3756,5.2113],[-453.0904,18.5105],[-452.9873,20.1493],[-453.7083,21.2235],[-455.1503,22.0873],[-454.522,23.3496],[-460.6916,26.5058],[-461.289,27.6574],[-461.2992,28.7426],[-457.8382,35.3534],[-455.7369,39.3952],[-445.6739,34.2014],[-441.6772,41.8974],[-425.8555,72.3159],[-418.9335,85.615],[-417.3988,84.7955],[-417.7696,84.0979],[-413.4746,81.9274],[-405.5329,96.8875],[-418.6549,103.4544],[-421.1786,98.5932],[-423.3827,99.7006],[-424.145,98.2057],[-432.869,102.7683],[-425.0714,117.518],[-430.2111,120.1979],[-433.394,114.1186],[-438.925,116.8207],[-440.7791,113.2329],[-443.6425,114.728],[-445.7541,110.6419]],holes:[[[-468.5507,21.6669],[-473.7522,24.369],[-436.2888,96.1132],[-431.0873,93.5218],[-454.3461,48.8076],[-455.9941,49.6271],[-462.741,36.8706],[-461.0209,35.9072]]]}],base_elevation_m:0,height_m:15.1},{id:"relation/19971852",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-361.8574,239.9119],[-364.0409,241.0525],[-363.7937,241.5176],[-373.0018,246.3348],[-373.3005,245.7701],[-377.8327,237.0775],[-378.9244,237.6423],[-383.0961,229.6362],[-382.0764,229.1047],[-399.6799,195.3752],[-401.6473,191.6102],[-392.8718,187.0366],[-393.4899,185.8518],[-390.7192,184.4011],[-393.2016,179.6506],[-401.7917,184.1356],[-402.2655,183.2276],[-403.9753,184.1246],[-406.4577,179.3741],[-403.9342,178.0674],[-404.5832,176.8272],[-405.9427,177.5359],[-425.1017,140.8388],[-426.1523,141.3814],[-428.5832,136.7417],[-427.4296,136.1437],[-431.076,129.1564],[-429.7371,128.4587],[-432.4358,123.2764],[-433.2701,123.7083],[-434.0529,122.2023],[-430.2111,120.1979],[-425.0714,117.518],[-424.8963,117.4183],[-424.4431,118.282],[-417.1714,114.4836],[-414.0709,120.43],[-412.8041,119.7766],[-388.464,166.4066],[-377.9787,160.936],[-393.7179,130.7832],[-378.0929,122.6327],[-370.0895,137.9804],[-362.4676,134.0048],[-346.8212,163.9805],[-359.9226,170.8242],[-352.2591,185.5186],[-349.0455,183.8353],[-311.7497,164.3673],[-300.0691,186.7356],[-298.4417,185.8829],[-292.6738,182.8708],[-288.4918,190.8769],[-294.3216,193.8779],[-333.5743,214.0657],[-334.9545,214.7744],[-329.3305,225.6485],[-347.5303,235.15],[-353.0819,238.0514],[-360.7449,242.0491]],holes:[[[-376.7935,189.0516],[-369.336,203.3363],[-355.6578,196.4039],[-370.9746,167.1259],[-386.0844,174.911],[-383.19,180.4477],[-380.2752,178.9637],[-375.3721,188.3097]]]}],base_elevation_m:0,height_m:48.7},{id:"way/1191618600",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-121.7638,501.7969],[-116.377,506.182],[-109.0126,515.2179],[-104.4188,524.0988],[-101.9469,530.754],[-100.1856,538.0071],[-100.6078,547.32],[-103.4196,555.6473],[-108.3737,560.7854],[-114.296,565.3145],[-121.3101,567.3743],[-127.356,568.1273],[-134.9057,567.8173],[-140.7972,566.4],[-149.7476,564.5729],[-158.3685,561.1956],[-164.3733,557.9511],[-171.8304,554.8727],[-176.4447,549.4135],[-179.2257,543.4892],[-179.8335,535.7378],[-176.136,525.4283],[-173.0255,520.0908],[-169.3795,513.8342],[-165.4759,510.036],[-158.4412,503.1925],[-148.9758,498.165],[-138.2023,496.3821],[-131.3014,496.5149]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/1191618603",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-188.663,317.8775],[-185.2228,319.6381],[-182.4212,322.2847],[-180.4539,325.5846],[-179.4754,329.3052],[-179.5783,333.1478],[-180.7422,336.8131],[-182.8639,340.0134],[-185.8096,342.516],[-189.3219,344.1107],[-192.5457,344.6644],[-195.8108,344.4429],[-198.942,343.4685],[-201.7538,341.8075],[-204.0919,339.5153],[-205.9563,336.4812],[-206.9657,333.0595],[-207.079,329.516],[-206.2654,326.05],[-204.5865,322.9051],[-202.1558,320.3028],[-199.138,318.387],[-195.7287,317.3017],[-192.1547,317.1356]],holes:[]}],base_elevation_m:0,height_m:8.75},{id:"way/1209647875",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-96.9623,444.6795],[-93.2853,444.4137],[-91.4725,448.7213],[-100.1856,538.0071],[-100.6078,547.32],[-103.4196,555.6473],[-108.3737,560.7854],[-114.296,565.3145],[-121.3101,567.3743],[-127.356,568.1273],[-134.9057,567.8173],[-140.7972,566.4],[-149.7476,564.5729],[-158.3685,561.1956],[-164.3733,557.9511],[-171.8304,554.8727],[-176.4447,549.4135],[-179.2257,543.4892],[-179.8335,535.7378],[-176.136,525.4283],[-173.0255,520.0908],[-169.3795,513.8342],[-165.4759,510.036],[-171.4911,500.1031],[-141.4674,487.778],[-118.1282,470.9903]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1384048510",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-243.2872,725.7713],[-234.193,704.0339],[-181.3247,725.9034],[-189.9452,747.7626],[-203.6644,742.071],[-212.3676,738.6162]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048511",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-257.201,786.8531],[-253.8746,763.654],[-220.6274,768.5148],[-211.4608,769.8324],[-196.7941,771.8255],[-200.1206,795.0245],[-214.6739,792.9429],[-224.026,791.6032]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048512",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-255.5417,849.5846],[-258.0861,826.2749],[-224.7362,822.8526],[-215.5078,821.7784],[-200.7589,820.2943],[-198.4721,843.6484],[-213.0356,845.1213],[-222.5214,846.1292]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048513",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-238.7937,909.9129],[-246.8277,887.6552],[-215.4143,876.3266],[-206.2169,873.0154],[-193.0748,868.2758],[-185.0512,890.5335],[-198.183,895.2621],[-207.1847,898.5178]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048514",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-207.4413,964.3056],[-220.6558,944.9271],[-192.796,926.1128],[-185.298,920.9414],[-173.1447,912.7358],[-160.1054,932.4576]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384101157",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-224.7362,822.8526],[-224.9012,806.7739],[-224.026,791.6032],[-214.6739,792.9429],[-214.9932,796.1653],[-213.1701,796.4311],[-213.8704,807.5932],[-213.6127,818.7885],[-215.6211,818.7775],[-215.5078,821.7784]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101158",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-206.2169,873.0154],[-215.4143,876.3266],[-219.8022,860.3807],[-222.5214,846.1292],[-213.0356,845.1213],[-212.4691,848.4212],[-210.6048,848.1665],[-209.2246,855.4861],[-205.599,869.8706],[-207.2057,870.2028]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101159",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-185.298,920.9414],[-192.796,926.1128],[-198.9655,916.18],[-207.1847,898.5178],[-198.183,895.2621],[-197.0706,898.0415],[-195.2785,897.2995],[-190.0977,908.2291],[-185.0818,917.4089],[-186.9048,918.2948]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101160",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-220.6274,768.5148],[-216.652,750.2324],[-212.3676,738.6162],[-203.6644,742.071],[-204.7149,745.0719],[-203.0051,745.5259],[-209.0404,767.1858],[-210.7501,766.8093],[-211.4608,769.8324]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101161",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-154.1216,909.8565],[-167.6138,918.4718],[-157.9219,933.122],[-206.8645,965.8448],[-209.7278,967.7495],[-225.0331,945.4587],[-221.8094,943.0779],[-222.7776,941.8044],[-196.4523,923.8317],[-202.6013,912.4593],[-207.9572,901.0758],[-241.6466,912.936],[-251.1123,887.5224],[-247.5281,886.3486],[-248.2285,884.5104],[-217.6803,873.4696],[-221.0896,861.0009],[-223.3969,848.4435],[-259.2907,851.8215],[-262.1132,824.7136],[-258.6732,824.3481],[-258.9719,822.5985],[-226.3327,819.3091],[-226.5182,805.5005],[-225.6533,793.6186],[-261.3208,788.2928],[-257.3559,761.5058],[-253.4729,762.0373],[-253.2464,760.033],[-221.6471,764.7166],[-218.0631,750.8304],[-214.4172,739.7679],[-247.7572,726.3029],[-236.7679,699.1726],[-193.6123,716.7789],[-194.2096,718.2739],[-179.6047,724.6631],[-185.5474,739.8671],[-173.6925,744.4625],[-174.1148,745.8024],[-171.097,746.8544],[-174.9489,757.3964],[-177.771,756.5881],[-178.6258,759.5004],[-179.7381,763.2211],[-182.9618,774.0732],[-186.1338,794.4043],[-187.5137,810.7377],[-186.2672,835.188],[-184.6192,845.0767],[-178.9542,864.1674],[-169.5608,889.0273],[-166.2237,895.5164],[-164.5448,898.8938],[-162.6806,901.9611],[-160.0954,900.4551]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1388933765",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-156.5422,884.2766],[-151.9178,877.3999],[-147.9938,870.1357],[-144.1007,859.9923],[-141.5465,850.159],[-140.0635,834.2574],[-141.4746,819.441],[-145.0075,805.9867],[-150.6724,794.0606],[-157.6968,782.9539],[-166.5236,773.4972],[-163.887,770.6513],[-141.7225,747.6846],[-141.1766,748.3711],[-130.3928,759.7989],[-123.4714,769.9311],[-116.4161,782.2891],[-111.0808,795.0458],[-106.7652,810.7702],[-109.68,811.3682],[-108.1041,821.4561],[-107.2491,834.1575],[-104.3756,834.1464],[-105.4672,851.3989],[-108.0626,863.912],[-111.8733,876.3698],[-119.4433,892.9137],[-127.1473,904.9396],[-127.7034,905.8144],[-153.8334,887.0671]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554451",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-217.6166,270.0624],[-222.2936,214.6949],[-219.7907,212.4912],[-218.8122,215.6582],[-213.6306,269.8741]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554454",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-181.3065,521.5083],[-188.6195,504.6213],[-189.454,491.1559],[-187.1058,479.0747],[-184.6236,474.5456],[-184.2013,470.5591],[-185.4477,459.1534],[-199.1883,411.3381],[-194.5946,410.3414],[-179.7828,462.3203],[-179.7827,470.559],[-181.307,478.6649],[-183.5111,484.2903],[-184.2011,491.7095],[-183.789,500.7677],[-181.9967,507.0906],[-175.7756,514.9195]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554455",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-107.9526,384.0853],[-107.7467,381.638],[-90,383.1882],[-90.2163,385.6355]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554456",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-97.7557,395.7124],[-99.2492,397.7278],[-111.1044,389.0462],[-109.6212,387.0308]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554457",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-361.413,304.8359],[-375.5453,268.4598],[-361.8877,263.2217],[-352.7203,286.8081],[-356.2222,288.148],[-351.2574,300.9378],[-354.543,302.2003]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1446422779",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-127.1473,904.9396],[-148.4468,889.7247],[-143.5031,882.3165],[-136.757,868.4745],[-133.9247,859.4939],[-131.2573,847.0804],[-130.6806,834.1576],[-128.7752,834.1244],[-107.2491,834.1575],[-104.3756,834.1464],[-105.4672,851.3989],[-108.0626,863.912],[-111.8733,876.3698],[-119.4433,892.9137]],holes:[]}],base_elevation_m:0,height_m:31.45},{id:"way/1446422780",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-132.339,816.5175],[-134.2342,808.7771],[-136.531,801.369],[-142.4431,788.867],[-148.1388,780.2187],[-153.2475,773.5857],[-159.3861,767.0081],[-141.1766,748.3711],[-130.3928,759.7989],[-123.4714,769.9311],[-116.4161,782.2891],[-111.0808,795.0458],[-106.7652,810.7702],[-109.68,811.3682],[-130.9279,816.1964]],holes:[]}],base_elevation_m:0,height_m:31.45},{id:"way/1459082762",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-128.7752,834.1244],[-129.5683,823.9146],[-130.9279,816.1964],[-109.68,811.3682],[-108.1041,821.4561],[-107.2491,834.1575]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/1459105110",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-35.0389,915.47],[-27.9631,896.6782],[-13.8837,904.6401],[-2.3277,910.653],[9.7433,915.3925],[21.7525,919.3125],[30.1775,921.4276],[50.0967,925.7463],[43.3196,944.4605],[36.3159,940.928],[25.5118,934.6272],[16.9426,930.3417],[2.9251,924.6278],[-9.8257,920.9292],[-23.2562,918.4155],[-30.8573,916.5995]],holes:[]}],base_elevation_m:0,height_m:9.9},{id:"way/1459105119",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-87.5343,1105.0379],[-77.6367,1078.1624],[-76.8643,1078.4503],[-76.0918,1076.3685],[-78.2753,1075.5712],[-75.0825,1066.8895],[-73.5685,1067.4432],[-70.1801,1058.2522],[-52.9492,1064.5972],[-52.1664,1063.811],[-51.188,1063.1023],[-49.9623,1062.5486],[-48.2732,1062.3604],[-47.3772,1062.3271],[-45.8117,1062.6372],[-44.5449,1063.6117],[-43.4325,1064.9183],[-42.9176,1066.1475],[-42.5468,1067.8639],[-42.6292,1068.4065],[-23.153,1075.5821],[-33.0095,1102.3358],[-34.6162,1101.7378],[-37.8707,1110.5966],[-36.4185,1111.1392],[-40.5382,1122.3456]],holes:[]}],base_elevation_m:0,height_m:61.1},{id:"way/1459105120",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-97.504,1120.6073],[-123.0056,1066.2587],[-124.0459,1063.5014],[-123.7369,1061.7074],[-122.5422,1060.888],[-100.2646,1050.7334],[-98.4726,1049.4046],[-97.3499,1047.7657],[-94.2602,1040.1582],[-70.2213,1049.039],[-17.993,1067.3545],[-24.0078,1082.9349],[-27.4787,1094.3407],[-37.881,1123.6412],[-39.2199,1124.8261],[-41.1665,1125.3466],[-42.9586,1124.815],[-73.5271,1113.5202],[-76.3594,1113.3651],[-78.821,1114.0296],[-94.9703,1121.2939],[-96.0929,1121.3603]],holes:[]}],base_elevation_m:0,height_m:5.5},{id:"way/1459105121",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-89.9546,1115.9343],[-91.139,1114.4394],[-108.1126,1077.9522],[-108.1126,1076.9888],[-107.886,1076.0143],[-106.7634,1075.1284],[-76.7099,1061.1092],[-74.7633,1060.0018],[-73.6407,1058.2854],[-70.2213,1049.039],[-69.2017,1046.2817],[-59.5717,1049.8473],[-16.788,1065.7156],[-17.993,1067.3545],[-24.0078,1082.9349],[-27.4787,1094.3407],[-31.0938,1102.9891],[-39.5186,1123.1097],[-72.1779,1112.1803],[-76.8744,1112.2467],[-81.3649,1113.8745],[-86.8236,1116.4658],[-88.9143,1116.6873]],holes:[]}],base_elevation_m:0,height_m:10.7},{id:"way/1459105140",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-153.6586,860.1806],[-152.227,856.1609],[-148.6016,857.4454],[-150.0332,861.4762]],holes:[]}],base_elevation_m:0,height_m:40.2}]};var Q=i=>document.querySelector(i),st=Q("#stage"),Bd=Q("#status");Q("#runtime-version").textContent=Fc;var Yr=[];window.addEventListener("error",i=>Yr.push(i.message));window.addEventListener("unhandledrejection",i=>Yr.push(String(i.reason)));var yg=performance.now();st.dataset.codeReadyMs=String(Math.round(yg));var hs=cg({width:innerWidth,height:innerHeight,coarse:matchMedia("(pointer:coarse)").matches,memory:navigator.deviceMemory,saveData:navigator.connection?.saveData}),zt,je,ni,et,Ke,Dd,Tn=null,ms=-1,dn=null,tn="all",xi=!1,hg=0,Mo=0,Ys=[],Kc=null,dg=0,nn=!1,yt,vo=0,qr=[0,0,0],si=!1,fg=!1,$c=!1,Qc=-1/0,xo=!1,yo=[];async function Xr(){si&&await new Promise(i=>{let e=()=>{Hi||nu||Zt.active||performance.now()-Qc<180?setTimeout(e,60):i()};e()})}var Sb=()=>new Promise(i=>requestAnimationFrame(()=>requestAnimationFrame(i))),Ld=[],Ud=0,ds,Zt,vi,Hi=!1,nu=!1,wt,Nd,xg,zn,jn,Gi=null,ii,eu,So,vg=2e3,fs={resize:0,resizeApplied:0,controlChange:0,controlsMoving:0,lodActivated:0},Pd=new Map,Zc=new Map,pg=new Os,mg=new he,kd=new WeakMap,qn,Fd=new WeakMap,$r=eg(),tu={mapped:new Wt({color:7576958,roughness:.8}),estimated:new Wt({color:13017956,roughness:.8}),unknown:new Wt({color:5150376,roughness:.8})};tu.surveyed=new Wt({color:3435864,roughness:.8});tu.mixed=new Wt({color:9666741,roughness:.8});var Od=as,bt=i=>String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);async function wb(i){if(Pd.has(i))return Pd.get(i);if(Zc.has(i))return Zc.get(i);let e=(async()=>{let t=await fetch(cs(`/campus-map/exports/campus-lod${i}.glb`));if(!t.ok)throw Error("Model load failed");let n=await t.arrayBuffer();await Xr();let s=await new Uc().parseAsync(n,"/campus-map/exports/");await Xr();let r=ag(s.scene,i),a=Tm(s.scene);return a.userData.photoArchitecture=r,a.traverse(o=>{if(o.isMesh){let l=Od(o);o.castShadow=["building","building_batch","building_detail","d6_screen","building_runtime_batch"].includes(l.kind),o.receiveShadow=!0,kd.set(o,o.material),Fd.set(o,$r.material(o.material)),o.material=Fd.get(o),$r.prepareMesh(o)}}),Pd.set(i,a),a})().finally(()=>Zc.delete(i));return Zc.set(i,e),e}async function Mi(i,e=!1){let t=++hg;if(ms===i)return;let n=await wb(i);t===hg&&(e&&(Hi||nu||Zt.active)||(Tn&&ni.remove(Tn),Tn=n,ms=i,ni.add(Tn),fs.lodActivated++,bi()))}function bi(){if(!Tn)return;Nd&&(Nd.visible=(zn?.layers||Wr).ground),eu?.update(Q("#show-surroundings").checked,zn?.layers||Wr),qn&&(qn.visible=(zn?.layers||Wr).buildings);let i=Q("#evidence-colors").checked;Q(".legend").style.display=i?"flex":"none",Tn.traverse(e=>{let t=e.userData;e.visible=(!t.phase||tn==="all"||t.phase===tn)&&(t.construction_status!=="construction_unverified"||Q("#construction").checked);let n=zn?.layers||Wr,s=Od(e).kind,r=kd.get(e)?.name||"";if(e.isMesh){let a=s?.startsWith("building")||s==="d6_screen"?"buildings":/asphalt|paving|parking/i.test(r)?"roads":/water surface/i.test(r)?"water":/vegetat|sport|track/i.test(r)?"green":s==="surface"?"ground":null;a&&!n[a]&&(e.visible=!1)}if(e.isMesh){let a=Od(e);e.material=i&&["building","building_detail","d6_screen","building_runtime_batch"].includes(a.kind)?tu[a.height_status]||tu.unknown:Fd.get(e)}}),Bd.textContent=`${tn==="all"?"\u5168\u6821":tn==="1"?"\u4E00\u671F":"\u4E8C\u671F"}\u7A7A\u95F4\u57FA\u7EBF \xB7 LOD ${ms}`,wt?.attachWater(Tn),ds?.refresh(),je.shadowMap.needsUpdate=!0,wt?.invalidateEnvironment(),yt?.invalidate()}function iu(){let i=Q("#lod").value;if(i!=="auto")return Q("#evidence-colors").checked?Math.min(1,Number(i)):Number(i);let e=et.position.distanceTo(Ke.target),t=e<(ms===0?430:340)?0:e<(ms===2?1400:1700)||Q("#evidence-colors").checked?1:2;return hs.lightweight&&wt?.quality==="balanced"?Math.max(1,t):t}function yi(i="all",e=xi){tn=i,xi=e;let n=zt.buildings.filter(m=>(i==="all"||m.phase===i)&&(Q("#construction").checked||m.construction_status!=="construction_unverified")).flatMap(m=>m.geometry.flatMap(p=>p.outer.map(([M,x])=>[M,x,m.base_elevation_m+(m.display_height_m??m.height_m)]))),s=n.length?[Math.min(...n.map(m=>m[0])),Math.min(...n.map(m=>m[1])),Math.max(...n.map(m=>m[0])),Math.max(...n.map(m=>m[1]))]:zt.bounds,r=(s[0]+s[2])/2,a=(s[1]+s[3])/2,o=new C(r,0,-a),l=new C(...e?[0,1,1e-5]:[.55,.82,.8]).normalize(),c=new C().crossVectors(new C(0,1,0),l).normalize(),u=new C().crossVectors(l,c).normalize(),h=Math.tan(ft.degToRad(et.fov/2)),d=100,f=Hd(),g=Math.max(.35,(st.clientWidth-f.left-f.right)/st.clientWidth),_=Math.max(.4,(st.clientHeight-f.top-f.bottom)/st.clientHeight);for(let[m,p,M]of n)for(let x of[0,M]){let y=new C(m-r,x,-p+a),w=y.dot(l);d=Math.max(d,Math.abs(y.dot(c))/(h*et.aspect*g*.86)+w,Math.abs(y.dot(u))/(h*_*.86)+w)}So=s,vg=d,wo(),Zt.move(o.clone().addScaledVector(l,d),o,!!Mo),document.querySelectorAll("[data-view]").forEach(m=>{m.classList.toggle("active",m.dataset.view===tn),m.setAttribute("aria-pressed",String(m.dataset.view===tn))}),sn(Q("#top"),"top",e?"\u900F\u89C6":"\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed",String(e)),bi(),si&&Mi(iu()),dn&&i!=="all"&&dn.phase!==i&&(dn=null,ps(),$s()),Gi&&i!=="all"&&Gi.phase!==i&&$s()}function wo(){So&&vi.setRegion(Q("#show-surroundings").checked&&ii?ii.bounds:So,Q("#show-surroundings").checked?4200:vg)}function Eb(){if(!ii)return;yi("all",!1),Q("#show-surroundings").checked=!0,wo(),bi(),dn=null,ps(),$s();let i=ii.bounds,e=new C((i[0]+i[2])/2,0,-(i[1]+i[3])/2),t=new C(.18,1,.65).normalize();Zt.move(e.clone().addScaledVector(t,5700),e),xi=!1,sn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false")}function ps(){qn&&(ni.remove(qn),qn.geometry.dispose(),qn.material.dispose(),qn=null,yt?.invalidate())}function $s(){Gi=null,zn?.clearSelection(),Q(".explore").classList.remove("has-selection"),Q(".detail").hidden=!0,Vi(),Q("#detail-title").textContent="\u4E24\u671F\u6821\u56ED\uFF0C\u540C\u4E00\u5750\u6807\u7CFB",Q("#detail-body").innerHTML=`<p>\u5EFA\u7B51\u5185\u9662\u3001\u9053\u8DEF\u8D70\u5411\u4E0E\u6821\u533A\u5173\u7CFB\u6765\u81EA\u516C\u5F00\u5730\u56FE\u5FEB\u7167\u3002\u4FDD\u7559\u6BCF\u680B\u5EFA\u7B51\u7684\u6765\u6E90\u8BB0\u5F55\uFF0C\u65B9\u4FBF\u6301\u7EED\u6821\u51C6\u3002</p><div class="big-stat">${zt.stats.buildings}<small>\u5DF2\u6536\u5F55\u5EFA\u7B51\u4E0E\u6784\u7B51\u7269</small></div>`,Q("#building").value=""}function Zr(i,e=!0){if(!i||nn)return;dn=i,Q("#building").value=i.id,ps(),Gi=null,au(),Q(".explore").classList.add("has-selection"),Q(".detail").hidden=!1,Vi(),i.construction_status==="construction_unverified"&&!Q("#construction").checked&&(Q("#construction").checked=!0,bi());let t=[];for(let r of i.parts.length?i.parts:[i]){let a=i.base_elevation_m+(i.uncertainty_display?i.display_height_m+.4:r.height_m+.7);for(let o of r.geometry)for(let l of[o.outer,...o.holes])for(let c=0;c<l.length;c++){let u=l[c],h=l[(c+1)%l.length];t.push(u[0],a,-u[1],h[0],a,-h[1])}}let n=new gt;n.setAttribute("position",new ut(t,3)),qn=new Di(n,new ui({color:15969591,depthTest:!1})),qn.renderOrder=5,qn.visible=zn?.layers.buildings??!0,ni.add(qn),Q("#detail-title").textContent=i.display_name||i.name;let s={mapped:"\u5730\u56FE\u5DF2\u6709\u9AD8\u5EA6\u8BB0\u5F55",estimated:"\u6309\u697C\u5C42\u4F30\u7B97",mixed:"\u5206\u4F53\u542B\u5730\u56FE\u9AD8\u5EA6\u4E0E\u4F30\u7B97",unknown:"\u672A\u77E5 \xB7 \u4EC5\u663E\u793A\u8F6E\u5ED3",surveyed:"\u6709\u5B9E\u6D4B\u8BB0\u5F55"};if(Q("#detail-body").innerHTML=`<span class="badge">${i.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${s[i.height_status]}</span><dl><dt>${i.uncertainty_display?"\u539F\u59CB\u4F30\u9AD8\uFF08\u672A\u663E\u793A\u4E3A\u5B9E\u4F53\uFF09":i.parts.length?"\u6700\u5927\u9876\u9AD8":"\u5EFA\u7B51\u9AD8\u5EA6"}</dt><dd>${i.height_status==="unknown"?"\u5F85\u6838\u5B9E":i.height_m.toFixed(2)+" m"}</dd><dt>${i.parts.length?"\u6700\u591A\u5C42\u6570":"\u5730\u56FE\u697C\u5C42"}</dt><dd>${i.levels??"\u672A\u6807\u6CE8"}</dd><dt>\u8F6E\u5ED3\u9762\u79EF</dt><dd>\u7EA6 ${Math.round(i.area_m2).toLocaleString()} m\xB2</dd><dt>\u5730\u9762\u9AD8\u7A0B</dt><dd>\u672A\u77E5\uFF0C\u6682\u7F6E\u7EDF\u4E00\u57FA\u51C6</dd><dt>\u7ACB\u9762\u6750\u8D28</dt><dd>${i.detail_profile?bt(i.detail_profile.facade_summary_zh||"\u4E3B\u7ACB\u9762\u6309\u822A\u62CD\u4F30\u7B97\uFF0C\u80CC\u9762\u53CA\u7AEF\u9762\u5F85\u6838\u5B9E"):"\u5C55\u793A\u7528\u8FD1\u4F3C\u8272\uFF0C\u5F85\u5B9E\u62CD\u6821\u51C6"}</dd><dt>\u5EFA\u8BBE\u72B6\u6001</dt><dd>${i.construction_status==="construction_unverified"?"\u5730\u56FE\u6807\u4E3A\u65BD\u5DE5\uFF0C\u5F53\u524D\u72B6\u6001\u5F85\u6838\u5B9E":"\u5730\u56FE\u6536\u5F55\uFF0C\u73B0\u72B6\u5F85\u6838\u5B9E"}</dd></dl><a class="source-link" href="${bt(i.source_url)}" target="_blank" rel="noreferrer">\u67E5\u770B\u539F\u59CB\u5730\u56FE\u8BB0\u5F55 \u2197</a><p>\u8BB0\u5F55\u66F4\u65B0\uFF1A${bt(i.source_timestamp?.slice(0,10))}\u3002${i.height_status==="estimated"?"\u9AD8\u5EA6\u6309\u516C\u5F00\u697C\u5C42\u4E0E\u4F30\u8BA1\u5C42\u9AD8\u6362\u7B97\uFF0C\u5C1A\u672A\u5B9E\u6D4B\u3002":"\u5730\u56FE\u8BB0\u5F55\u4E0D\u7B49\u540C\u4E8E\u5B9E\u5730\u6D4B\u91CF\u3002"}</p>`,zn?.addActions(i,r=>ds.showInside(r)),i.publicPlace){let r=document.createElement("details");r.className="part-records";let a=document.createElement("summary");a.textContent="\u6821\u56ED\u5730\u70B9\u8D44\u6599",r.append(a),cu(r,i.publicPlace),Q("#detail-body").append(r)}if(i.uncertainty_display&&Q("#detail-body").insertAdjacentHTML("afterbegin",`<p><strong>\u5F85\u6838\u8F6E\u5ED3 \xB7 \u5DF2\u91C7\u7528 B \u65B9\u6848</strong></p><p>${bt(i.uncertainty_display.summary_zh)}</p><p>${bt(i.uncertainty_display.remaining_zh)}</p>`),i.courtyard_photo&&Q("#detail-body").insertAdjacentHTML("afterbegin",`<p><strong>\u5185\u9662\u5DF2\u6309\u7167\u7247\u6BD4\u4F8B\u6316\u7A7A \xB7 \u5C3A\u5BF8\u53CA\u9662\u5E95\u4F30\u7B97</strong></p><p>${bt(i.courtyard_photo.summary_zh)}</p><p>${bt(i.courtyard_photo.remaining_zh)}</p>`),i.d6_screen_photo&&Q("#detail-body").insertAdjacentHTML("afterbegin","<p><strong>D6\u524D\u90E8\u5DF2\u91C7\u7528\u7167\u7247\u6BD4\u4F8B \xB7 \u5C3A\u5BF8\u4F30\u7B97</strong></p><p>\u524D\u90E8\u4E2D\u6BB5\u6682\u630913.2\u7C73\u3001\u4E24\u4FA79.9\u7C73\u53CA\u5F27\u5F62\u683C\u6805\u8868\u8FBE\uFF1B\u66F2\u7387\u3001\u5206\u683C\u3001\u539A\u5EA6\u548C\u8272\u5F69\u5747\u672A\u5B9E\u6D4B\u3002\u539F\u5730\u56FE\u7EDF\u4E0014.62\u7C73\u5206\u4F53\u8BB0\u5F55\u4FDD\u7559\uFF0C\u4E0D\u80FD\u636E\u672C\u6A21\u578B\u8BA4\u5B9A\u5730\u56FE\u9AD8\u5EA6\u9519\u8BEF\u3002</p><p>\u4E0B\u90E8\u7FFC\u697C\u3001\u95E8\u5385\u8FDB\u6DF1\u3001\u652F\u6491\u548C\u5730\u5F62\u4ECD\u5F85\u6838\u5B9E\uFF1B\u683C\u6805\u540E\u4E3A\u4E0D\u900F\u660E\u80CC\u666F\uFF0C\u4E0D\u8868\u793A\u5165\u53E3\u53EF\u901A\u884C\u3002\u8F7B\u91CF\u6863\u7701\u7565\u7EC6\u683C\u6805\u3002</p>"),i.parts.length){let r=i.parts.map(a=>`<li><a href="${bt(a.source_url)}" target="_blank" rel="noreferrer">${bt(a.id)} \u2197</a><br>${a.min_height_m.toFixed(1)}\u2013${a.height_m.toFixed(1)} m \xB7 ${s[a.height_status]}</li>`).join("");Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>${i.parts.length} \u4E2A\u516C\u5F00\u5EFA\u7B51\u5206\u4F53</strong>\uFF0C\u9AD8\u5EA6\u4E0E\u697C\u5C42\u663E\u793A\u5176\u4E2D\u6700\u5927\u503C\u3002\u5404\u5206\u4F53\u5206\u522B\u4FDD\u7559\u9AD8\u5DEE\u4E0E\u67B6\u7A7A\u90E8\u5206\u3002${i.part_gap_area_m2>.1?`\u5206\u4F53\u672A\u8986\u76D6\u8F6E\u5ED3\u7684\u7EA6 ${i.part_gap_area_m2.toFixed(1)} m\xB2 \u533A\u57DF\u6682\u7559\u7A7A\u3002`:""}</p><details class="part-records"><summary>\u5206\u4F53\u9AD8\u5EA6\u4E0E\u6765\u6E90</summary><p>\u533A\u95F4\u4E3A\u57FA\u51C6\u5730\u9762\u4EE5\u4E0A\u5E95\u90E8\u81F3\u9876\u90E8\uFF1B\u697C\u5C42\u6362\u7B97\u7684\u5E95\u9AD8\u4E0E\u9876\u9AD8\u5747\u4E3A\u4F30\u7B97\u3002</p><ul>${r}</ul></details>`)}if(i.official_map_label){let r=i.official_map_label;Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5B66\u6821\u5730\u56FE\u6807\u8BC6</strong>\uFF1A${bt(r.label_zh)} \xB7 <a href="${bt(r.source_url)}" target="_blank" rel="noreferrer">\u67E5\u770B\u624B\u7ED8\u5730\u56FE \u2197</a>\u3002\u6B64\u9879\u6838\u5BF9\u5EFA\u7B51\u6807\u8BC6\uFF0C\u4E0D\u8868\u793A\u5C3A\u5BF8\u5DF2\u5B9E\u6D4B\u3002</p>`)}if(i.material_reference){let r=i.material_reference;Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5899\u9762\u4E3B\u6750\u4F9D\u636E</strong>\uFF1A${bt(r.summary_zh)} <a href="${bt(r.source.url)}" target="_blank" rel="noreferrer">\u8BBE\u8BA1\u65B9\u9879\u76EE\u8BF4\u660E \u2197</a></p>`),Q("#detail-body").insertAdjacentHTML("beforeend","<p>\u5899\u9762\u9897\u7C92\u4E3A\u663E\u793A\u4F30\u7B97\uFF0C\u9897\u7C92\u5927\u5C0F\u3001\u8D77\u4F0F\u53CA\u5B9E\u9645\u53CD\u5C04\u5C1A\u672A\u6D4B\u91CF\uFF1B\u8F7B\u91CF\u89C6\u56FE\u7701\u7565\u5FAE\u8868\u9762\u3002</p>")}if(i.geometry_observations?.length){let r=i.geometry_observations.map(a=>`<p>${bt(a.summary_zh)}</p><p>${a.sources.map((o,l)=>`<a href="${bt(o.url)}" target="_blank" rel="noreferrer">\u5B9E\u666F\u53C2\u8003 ${l+1} \u2197</a>`).join(" \xB7 ")}</p>`).join("");Q("#detail-body").insertAdjacentHTML("beforeend",`<details class="part-records" open><summary>\u5DF2\u77E5\u51E0\u4F55\u7F3A\u53E3</summary>${r}<p>\u8FD9\u4E9B\u533A\u57DF\u5C1A\u672A\u5B8C\u6210\u5B9E\u666F\u5F62\u72B6\u9A8C\u6536\u3002</p></details>`)}if(i.detail_profile){let r=i.detail_sources.map(a=>`<a href="${bt(a.url)}" target="_blank" rel="noreferrer">\u7167\u7247\u53C2\u8003 \u2197</a>`).join(" \xB7 ");Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5C40\u90E8\u7167\u7247\u7EC6\u8282</strong>\uFF1A${bt(i.detail_profile.description_zh||"\u6A2A\u5411\u7A97\u5E26"+(i.detail_profile.pv_zones.length?"\u3001\u5C4B\u9876\u5149\u4F0F\u8986\u76D6\u533A":"")+"\u3002\u4F4D\u7F6E\u5BF9\u5E94\u516C\u5F00\u8F6E\u5ED3\uFF0C\u7EC6\u8282\u5C3A\u5BF8\u4E0E\u989C\u8272\u4E3A\u7167\u7247\u4F30\u7B97\u3002")}\u62CD\u6444\u65E5\u671F\u672A\u77E5\u3002\u8FD1\u666F\u53CA\u6807\u51C6\u6863\u53EF\u89C1\u3002</p><p>${r}</p>`)}if(i.photo_volume&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u7167\u7247\u4F30\u7B97\u4F53\u91CF</strong>\uFF1A${bt(i.photo_volume.summary_zh)}</p><p><strong>\u5C1A\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.photo_volume.remaining_zh)}</p>`),i.podium_photo&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u88D9\u697C\u66F2\u9762\u4F30\u7B97</strong>\uFF1A${bt(i.podium_photo.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.podium_photo.remaining_zh)}</p>`),i.library_terraces&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u53F0\u9636\u4E0E\u79CD\u690D\u4F30\u7B97</strong>\uFF1A${bt(i.library_terraces.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.library_terraces.remaining_zh)}</p>`),i.library_roof_edges&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5C4B\u9876\u8FB9\u5899\u4F30\u7B97</strong>\uFF1A${bt(i.library_roof_edges.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.library_roof_edges.remaining_zh)}</p>`),e){tn!=="all"&&tn!==i.phase&&yi(i.phase,!1);let r=new C(i.centroid[0],(i.display_height_m??i.height_m)/2,-i.centroid[1]),a=Math.max(120,Math.sqrt(i.area_m2)*3.4)*(innerWidth<760?1.5:1),o=new C(.7,.8,1),l=i.detail_profile?.view_edge!==void 0||i.detail_profile?.kind==="curtainwall"?i.detail_profile:i.detail_profile?.components?.find(u=>u.preferred_view)||i.detail_profile?.components?.find(u=>["residential_grid","curved_bands"].includes(u.kind));if(l){let u=l.view_edge!==void 0?l.edges.indexOf(l.view_edge):l.kind==="curved_bands"?Math.floor(l.anchors.length/2):0,[h,d]=l.anchors[u],f=Math.hypot(d[0]-h[0],d[1]-h[1]);o=new C((d[1]-h[1])/f,.8,(d[0]-h[0])/f)}Vi();let c=a*o.length();if(o.normalize(),st.clientWidth<=760){let u=Hd(),h=Math.tan(ft.degToRad(et.fov/2)),d=Math.max(.2,(st.clientWidth-u.left-u.right)/st.clientWidth),f=Math.max(.12,(st.clientHeight-u.top-u.bottom)/st.clientHeight),g=new C().crossVectors(new C(0,1,0),o).normalize(),_=new C().crossVectors(o,g).normalize();for(let m of i.geometry)for(let[p,M]of m.outer)for(let x of[i.base_elevation_m,i.base_elevation_m+(i.display_height_m??i.height_m)]){let y=new C(p,x,-M).sub(r),w=y.dot(o);c=Math.max(c,Math.abs(y.dot(g))/(h*et.aspect*d*.82)+w,Math.abs(y.dot(_))/(h*f*.82)+w)}}Zt.move(r.clone().addScaledVector(o,c),r,si),xi=!1,sn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false"),si&&Mi(iu())}yt.invalidate()}function Id(i,e=!0){let t=zt.buildings.find(n=>n.id===i.id);t?Zr(t,e):Tb(i,e)}function bg(i){if(!i?.nearby)return;let e=ii?.bounds||So;vi.setRegion([Math.min(e[0],i.centroid[0]-150),Math.min(e[1],i.centroid[1]-150),Math.max(e[2],i.centroid[0]+150),Math.max(e[3],i.centroid[1]+150)],4200)}function zd(i,e=210){i.nearby?(Q("#show-surroundings").checked=!0,wo(),bi(),e=i.road?750:420):tn!=="all"&&i.phase!==tn&&yi(i.phase==="all"?"all":i.phase,!1);let t=new C(i.centroid[0],Math.min(60,i.labelHeight||0),-i.centroid[1]);bg(i);let n=et.position.clone().sub(Ke.target).normalize();Zt.move(t.clone().addScaledVector(n,e),t,si),xi=!1,sn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false")}function Tb(i,e=!0){if(nn)return;dn=null,Gi=i,ps(),Q("#building").value="",au(),Q(".explore").classList.add("has-selection"),Q(".detail").hidden=!1,Vi(),Q("#detail-title").textContent=i.name,Q("#detail-body").innerHTML=`<span class="badge">${i.nearby?"\u5B66\u6821\u5468\u8FB9":i.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${bt(ri.find(([s])=>s===i.category)?.[1]||"\u5730\u70B9")}</span>`,cu(Q("#detail-body"),i);let t=document.createElement("a");t.href=i.source_url,t.target="_blank",t.rel="noreferrer",t.className="source-link",t.textContent="\u67E5\u770B\u5730\u56FE\u8BB0\u5F55 \u2197",Q("#detail-body").append(t);let n=document.createElement("p");if(n.textContent=`\u5730\u70B9\u5FEB\u7167\uFF1A${(i.sourceTimestamp||jn.sourceTimestamp).slice(0,10)}\u3002\u8425\u4E1A\u3001\u697C\u5C42\u548C\u901A\u884C\u60C5\u51B5\u4EE5\u73B0\u573A\u4E3A\u51C6\u3002`,Q("#detail-body").append(n),i.nearby){let s=document.createElement("p"),r=ii?.bounds,a=r&&(i.centroid[0]<r[0]||i.centroid[1]<r[1]||i.centroid[0]>r[2]||i.centroid[1]>r[3]);s.textContent=a?"\u8BE5\u5730\u70B9\u4F4D\u4E8E\u5DF2\u5EFA\u6A21\u533A\u57DF\u4E4B\u5916\uFF0C\u5F53\u524D\u663E\u793A\u6765\u6E90\u5730\u56FE\u7684\u4F4D\u7F6E\u6807\u6CE8\u3002":i.road?"\u9053\u8DEF\u8D70\u5411\u6765\u81EA\u516C\u5F00\u5730\u56FE\uFF0C\u663E\u793A\u5BBD\u5EA6\u4E3A\u793A\u610F\u3002":"\u5468\u8FB9\u5EFA\u7B51\u4EE5\u5730\u56FE\u8F6E\u5ED3\u663E\u793A\uFF0C\u9AD8\u5EA6\u4E0E\u5916\u5899\u5C1A\u672A\u5B9E\u6D4B\u3002",Q("#detail-body").append(s)}zn.addActions(i),e&&zd(i),ds.refresh(),yt.invalidate()}async function gg(){if(nn)return;let i=Q("#export-4k");i.disabled=!0,i.textContent="\u6B63\u5728\u751F\u6210 4K\u2026";let e=ms,t=wt.quality;Zt.cancel(),Ke.stopMotion(),Ke.enabled=!1,nn=!0;let n=et.aspect,s=et.view?{...et.view}:null,r=[...document.querySelectorAll(".explore button,.explore select,.explore input,.map-settings button,.map-settings select,.map-settings input,.map-tools button,.view-dock button,.render-studio button,.render-studio input,#close-detail")].map(l=>[l,l.disabled]);r.forEach(([l])=>l.disabled=!0);let a=qn,o=a?.visible;a&&(a.visible=!1);try{await Mi(0),a&&(a.visible=!1),wt.setQuality("ultra"),je.setPixelRatio(1),je.setSize(3840,2160,!1),wt.resize(3840,2160),et.clearViewOffset(),et.aspect=3840/2160,et.updateProjectionMatrix(),wt.updateShadows(!0),wt.updateEnvironment();let l=document.createElement("canvas");l.width=3840,l.height=2160;let c=l.getContext("2d",{alpha:!1});for(let d=0;d<16;d++){let[f,g]=km(d);et.setViewOffset(3840,2160,f,g,3840,2160),Eo(),c.globalAlpha=1/(d+1),c.drawImage(je.domElement,0,0),i.textContent=`\u6B63\u5728\u6E32\u67D3 ${d+1} / 16\u2026`,Q("#studio-export").textContent=`\u6E32\u67D3 ${d+1} / 16`,d%2===1&&await new Promise(_=>setTimeout(_,0))}let u=l.toDataURL("image/png"),h=`BNBU-4K-${dn?.name||Gi?.name||tn}-${Date.now()}.png`;Ab(u,h)}catch(l){zn.toast("\u5BFC\u51FA\u5931\u8D25\uFF1A"+l.message)}finally{et.aspect=n,s?et.setViewOffset(s.fullWidth,s.fullHeight,s.offsetX,s.offsetY,s.width,s.height):et.clearViewOffset(),et.updateProjectionMatrix(),a&&(a.visible=o),wt.setQuality(t),qr=[0,0,0],bo();try{await Mi(e)}finally{nn=!1,Ke.enabled=!0,r.forEach(([l,c])=>l.disabled=c),i.disabled=!1,i.textContent="\u4FDD\u5B58 4K \u753B\u9762",Q("#studio-export").textContent="\u6E32\u67D3 4K \u539F\u56FE",yt.invalidate()}}}function Ab(i,e){document.querySelector("#export-preview")?.remove();let t=document.createElement("dialog");t.id="export-preview",t.className="export-dialog",t.setAttribute("aria-label","4K \u753B\u9762\u9884\u89C8");let n=document.createElement("h2");n.textContent="4K \u753B\u9762\u5DF2\u751F\u6210";let s=document.createElement("p");s.textContent="3840 \xD7 2160 PNG \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 \u5F53\u524D\u89C6\u89D2\u4E0E\u5149\u7167";let r=document.createElement("img");r.id="export-preview-image",r.src=i,r.alt="\u5F53\u524D\u6821\u56ED\u89C6\u89D2\u7684 4K \u6E32\u67D3\u753B\u9762";let a=document.createElement("div");a.className="export-actions";let o=document.createElement("a");o.id="download-4k",o.href=i,o.download=e,o.textContent="\u4E0B\u8F7D PNG";let l=document.createElement("button");l.textContent="\u8FD4\u56DE\u5730\u56FE",l.onclick=()=>t.close(),a.append(o,l),t.append(n,s,r,a),document.body.append(t),t.addEventListener("close",()=>t.remove(),{once:!0}),t.showModal(),fetch(i).then(c=>c.blob()).then(c=>fetch("/api/exports",{method:"POST",headers:{"Content-Type":"image/png"},body:c})).then(async c=>{if(!c.ok)return;let u=await c.json();r.src=u.url,o.href=u.url+"?download=1",s.textContent="3840 \xD7 2160 PNG \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 \u5DF2\u4FDD\u5B58\u5230\u672C\u5730"}).catch(()=>{})}function Hd(){let i=st.clientWidth<=760,e=Q(".explore").getBoundingClientRect(),t=Q(".render-studio"),n=t&&!t.hidden?t.getBoundingClientRect().width:0;return i&&n?{left:12,right:46,top:60,bottom:Math.min(st.clientHeight*.46,t.getBoundingClientRect().height)+112}:i?{left:12,right:60,top:e.bottom+12,bottom:Q(".detail").hidden?64:Math.min(240,Q(".detail").getBoundingClientRect().height)+80}:{left:e.right+24,right:Math.max(n?n+40:80,Q(".detail").hidden?80:Q(".detail").getBoundingClientRect().width+40),top:24,bottom:80}}function Vi(){if(!et)return;let{left:i,right:e,top:t,bottom:n}=Hd(),s=st.clientWidth,r=st.clientHeight;et.setViewOffset(s,r,-(i-e)/2,-(t-n)/2,s,r),yt?.invalidate()}function Rb(){xi=!xi;let i=Ke.target.clone(),e=et.position.distanceTo(i),t=new C(...xi?[0,1,1e-5]:[.55,.82,.8]).normalize();Zt.move(i.clone().addScaledVector(t,e),i),sn(Q("#top"),"top",xi?"\u900F\u89C6":"\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed",String(xi))}function _g(i){nn||(Zt.cancel(),Ke.zoomBy(i))}var yn;function Cb(i){if(nn||!yn||yn.dragged||i.pointerId!==yn.id||i.button!==0||i.ctrlKey||i.metaKey||i.shiftKey||Math.hypot(i.clientX-yn.x,i.clientY-yn.y)>5)return;let e=je.domElement.getBoundingClientRect();mg.set((i.clientX-e.left)/e.width*2-1,-(i.clientY-e.top)/e.height*2+1),pg.setFromCamera(mg,et);let t=pg.intersectObject(Tn,!0).filter(n=>{for(let s=n.object;s;s=s.parent)if(!s.visible)return!1;return!0});for(let n of t){let s=Em(n),r=zt.buildings.find(a=>a.id===(s.id||s.building_id));if(r){Zr(r);return}}}function bo(){fs.resize++;let i=st.getBoundingClientRect(),e=Math.max(1,Math.floor(i.width)),t=Math.max(1,Math.floor(i.height)),n=Qm(wt?.quality||"high",e,t,devicePixelRatio,xo);qr[0]===e&&qr[1]===t&&qr[2]===n||(qr=[e,t,n],fs.resizeApplied++,je.setPixelRatio(n),je.setSize(e,t),wt?.resize(Math.floor(e*n),Math.floor(t*n)),et.aspect=e/t,et.updateProjectionMatrix(),Vi(),yt?.invalidate())}function Eo(){let i=performance.now();je.shadowMap.needsUpdate&&Ud++,je.info.reset(),wt?wt.render(!nn&&(nu||Zt.active||Hi)):je.render(ni,et),ds?.update(),vo++,nn&&Ld.push(performance.now()-i)}function Mg(i=!1){let e=Ys.length?Ys.reduce((n,s)=>n+s[1],0)/Ys.length:0,t=i?"\u9759\u6B62\u89C6\u56FE":e?`${(1e3/e).toFixed(0)} FPS`:"\u6B63\u5728\u7ED8\u5236";Q("#metrics").textContent=`${t} \xB7 ${je.info.render.triangles.toLocaleString()} \u4E09\u89D2\u9762 \xB7 ${je.info.render.calls} \u7ED8\u5236/\u5E27`,Q("#render-state").textContent=`${i?"\u5DF2\u6682\u505C\u91CD\u7ED8":nn?"\u8FDE\u7EED\u91C7\u6837":"\u6309\u9700\u7ED8\u5236"} \xB7 \u7D2F\u8BA1 ${vo} \u5E27`}function Pb(i){if(!si)return!1;let e=Kc===null?0:i-Kc;Kc=i,e>0&&(Ys.push([i,e]),Ys=Ys.filter(l=>i-l[0]<=5e3).slice(-360));let t=Zt.active,n=Zt.update(i),s=t?n:Dd.update(i);nu=s,(s||Hi||n)&&(Qc=i,e>0&&document.visibilityState==="visible"&&(yo.push(e),yo.length>600&&yo.shift()));let r=hs.lightweight&&!nn&&(s||Hi||i-Qc<180);r!==xo&&(xo=r,bo()),!s&&!Hi&&(wt?.updateShadows(),Tn&&wt?.updateEnvironment()),n||vi.constrain(),s&&fs.controlsMoving++;let a=iu();a!==ms&&!nn&&!s&&!n&&!Hi&&Mi(a,!0).catch(Jc);let o=xg?.update(i,nn);if(Eo(),i-dg>600&&(Mg(),dg=i,yo.length)){let l=[...yo].sort((c,u)=>c-u);st.dataset.gestureTiming=JSON.stringify({samples:l.length,medianMs:+l[Math.floor(l.length/2)].toFixed(1),p95Ms:+l[Math.ceil(l.length*.95)-1].toFixed(1),maxMs:+l.at(-1).toFixed(1),scope:"visible browser animation frames during motion, not physical-device GPU timing"})}return Q("#north").style.transform=`rotate(${-Ke.getAzimuthalAngle()*180/Math.PI}deg)`,st.dataset.motionResolution=String(xo),st.dataset.pixelRatio=String(je.getPixelRatio()),s||o||xo}async function Ib(){if(nn||!Mo)return;nn=!0,Q("#run-qa").disabled=!0,Q("#run-qa").textContent="\u6B63\u5728\u68C0\u67E5\u2026",Zt.cancel();let i=[...document.querySelectorAll(".explore button,.explore select,.explore input,.map-settings button,.map-settings select,.map-settings input,.map-tools button,.view-dock button,.render-studio button,.render-studio input,.map-label,#close-detail,#qa-duration")];i.forEach(e=>e.disabled=!0),Ke.enabled=!1;try{let e={app:"BNBU campus viewer",viewerVersion:Fc,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,viewport:{width:st.clientWidth,height:st.clientHeight,dpr:devicePixelRatio,windowInnerSize:[innerWidth,innerHeight]},navigation:{mode:st.dataset.dragMode,target:Ke.target.toArray(),camera:et.position.toArray(),distance:et.position.distanceTo(Ke.target),polarDegrees:ft.radToDeg(Ke.getPolarAngle()),minDistance:Ke.minDistance,maxDistance:vi.maxDistance,bounds:vi.bounds},loadMs:Math.round(Mo-yg),webgl:je.capabilities.isWebGL2?"WebGL2":"unknown",models:[],errors:[...Yr],limitations:["Current desktop browser only; viewport tests do not establish physical mobile-device acceptance.","Spatial baseline with partial photo-estimated detail; no surveyed terrain or complete facades."]};e.visualQuality={...wt.diagnostics(),materials:$r.counts,textureLibrary:$r.textureLibrary,photoArchitecture:Tn?.userData.photoArchitecture,surroundings:eu?.diagnostics};let t=await(await fetch("/evidence/build-report.json")).json(),n=await(await fetch("/campus-map/data/processed/paint-material/material.json")).json(),s=ms;for(let d=0;d<3;d++){Q("#run-qa").textContent=`\u6838\u5BF9 LOD ${d}\u2026`,await Mi(d),Eo();let g=new Gt().setFromObject(Tn).getSize(new C),_=je.info.render.calls,m=je.info.render.triangles,p=0;Tn.traverse(P=>{P.isMesh&&p++});let M=await(await fetch(`/campus-map/exports/campus-lod${d}.glb`)).arrayBuffer(),x=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",M))).map(P=>P.toString(16).padStart(2,"0")).join(""),y=t.exports.find(P=>P.file===`campus-lod${d}.glb`),w=y?.sha256===x&&y.bytes===M.byteLength,T=await Am(Tn,kd,d,n);e.models.push({lod:d,sha256:x,bytes:M.byteLength,matchesBuild:w,meshCount:p,paintTextures:T,runtimeBatching:Tn.userData.runtimeBatching,boundsMetres:g.toArray().map(P=>+P.toFixed(3)),renderCalls:_,renderTriangles:m,finiteBounds:g.toArray().every(Number.isFinite)})}await Mi(s),Eo(),e.samplingContext={lod:s,view:tn,selectionId:dn?.id??null,renderCalls:je.info.render.calls,renderTriangles:je.info.render.triangles,renderPixelRatio:je.getPixelRatio(),drawingBufferPixels:je.getDrawingBufferSize(new he).toArray()};let r=Number(Q("#qa-duration").value);Q("#run-qa").textContent=`\u91C7\u6837\u81F3\u5C11 ${r/1e3} \u79D2\uFF0C\u8BF7\u4FDD\u6301\u9875\u9762\u6FC0\u6D3B\u2026`;let a=vo;Ld=[];let o=Ud;yt.setContinuous(!0),e.frameTime=await vm(void 0,r),e.renderActivity={mode:"forced-continuous-for-qa",renderedFrames:vo-a};let l=[...Ld].sort((d,f)=>d-f);e.renderWork={scope:"Main-thread renderer submission and labels, not GPU completion or refresh rate",samples:l.length,averageMs:l.length?l.reduce((d,f)=>d+f,0)/l.length:null,p95Ms:l[Math.ceil(l.length*.95)-1]??null,shadowUpdatesDuringSampling:Ud-o},yt.setContinuous(!1),Q("#run-qa").textContent="\u68C0\u67E5\u9759\u6B62\u65F6\u662F\u5426\u505C\u6B62\u7ED8\u5236\u2026";let c={...fs};e.idleRendering=await Sm(()=>({idle:yt.idle,renderedFrames:vo})),e.idleRendering.eventCounts=Object.fromEntries(Object.keys(fs).map(d=>[d,fs[d]-c[d]])),e.selection={id:dn?.id??null,title:Q("#detail-title").textContent},e.currentView=tn,e.resources=performance.getEntriesByType("resource").map(d=>({url:d.name,bytes:d.transferSize,durationMs:+d.duration.toFixed(2)})),e.assetStatus=e.models.every(d=>d.meshCount>0&&d.finiteBounds&&d.matchesBuild&&d.paintTextures.pass)&&!Yr.length?"PASS":"FAIL",e.performanceStatus=e.frameTime.valid?"MEASURED":"INCONCLUSIVE",e.status=e.assetStatus!=="PASS"||e.idleRendering.status==="FAIL"?"FAIL":e.frameTime.valid&&e.idleRendering.status==="PASS"?"PASS":"PASS_WITH_LIMITS";let u=await fetch("/api/evidence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!u.ok)throw Error("Cannot save evidence: HTTP "+u.status);let h=await u.json();e.saved=h.saved,Q("#qa-report").textContent=JSON.stringify(e,null,2),Q("#run-qa").textContent=e.status==="PASS"?"\u52A0\u8F7D\u901A\u8FC7 \xB7 \u91C7\u6837\u5B8C\u6210":e.status==="PASS_WITH_LIMITS"?"\u52A0\u8F7D\u901A\u8FC7 \xB7 \u6027\u80FD\u5F85\u590D\u6D4B":"\u68C0\u67E5\u53D1\u73B0\u95EE\u9898"}catch(e){Q("#qa-report").textContent=String(e.stack),Q("#run-qa").textContent="\u9A8C\u6536\u5931\u8D25",Yr.push(String(e))}finally{yt.setContinuous(!1),nn=!1,Q("#run-qa").disabled=!1,i.forEach(e=>e.disabled=!1),Ke.enabled=!0,yt.invalidate()}}function Jc(i){parent.postMessage({type:"huitongli-map-error"},location.origin),Yr.push(String(i)),Q("#loading").style.display="flex",Q("#loading").innerHTML=`<strong>\u6A21\u578B\u52A0\u8F7D\u5931\u8D25</strong><span>${bt(i.message||i)}</span><span>\u8BF7\u8FD0\u884C npm start\uFF0C\u5E76\u5237\u65B0\u9875\u9762\u3002</span>`,Bd.textContent="\u52A0\u8F7D\u5931\u8D25"}async function Db(){try{let l=function(u){wd(Ke,u),st.dataset.dragMode=u,document.querySelectorAll("button[data-drag-mode]").forEach(h=>h.setAttribute("aria-pressed",String(h.dataset.dragMode===u))),Q("#drag-help").textContent=u==="pan"?"\u5DE6\u952E / \u5355\u6307\u62D6\u52A8\u5E73\u79FB \xB7 \u53F3\u952E\u65CB\u8F6C":"\u5DE6\u952E / \u5355\u6307\u62D6\u52A8\u65CB\u8F6C \xB7 \u53F3\u952E\u5E73\u79FB",Q("#touch-help").textContent=u==="pan"?"\u53CC\u6307\u7F29\u653E\u4E0E\u65CB\u8F6C":"\u53CC\u6307\u7F29\u653E\u4E0E\u5E73\u79FB"};zt=ug,st.dataset.dataReadyMs=String(Math.round(performance.now())),je=new Rc({antialias:!0,alpha:!1,powerPreference:"high-performance"}),je.setPixelRatio(Math.min(devicePixelRatio,1.75)),je.setClearColor(15133927),je.outputColorSpace=Rt,je.toneMapping=Dr,je.toneMappingExposure=.85,je.shadowMap.enabled=!0,je.shadowMap.type=Xa,je.shadowMap.autoUpdate=!1,st.appendChild(je.domElement),je.domElement.setAttribute("aria-label","\u62D6\u52A8\u5E73\u79FB\u3001\u6EDA\u8F6E\u7F29\u653E\u3001\u70B9\u51FB\u5EFA\u7B51\uFF1B\u53EF\u5207\u6362\u65CB\u8F6C\u6A21\u5F0F"),ni=new Rs,et=new Dt(42,innerWidth/innerHeight,1,12e3),Ke=new Dc(et,je.domElement,{reducedMotion:()=>matchMedia("(prefers-reduced-motion: reduce)").matches}),Ke.panSpeed=.8,Ke.rotateSpeed=.65,Ke.zoomSpeed=.8,vi=Nm(et,Ke),Ke.getMaxZoomDistance=()=>vi.maxDistance,yt=bm({render:Pb,onError:Jc,onIdle:()=>{Ke.rest(),Ys=[],Kc=null,Mg(!0),Mo&&zn?.saveView()}}),Dd=Mm(Ke,et),Zt=Um({camera:et,controls:Ke,invalidate:()=>yt.invalidate()}),Ke.addEventListener("wake",()=>yt.invalidate()),Ke.addEventListener("change",()=>{Zt.active||vi.constrain(),fs.controlChange++,Dd.updating||yt.invalidate()}),Ke.addEventListener("start",()=>{Hi=!0,$c=!0,Qc=performance.now(),je.domElement.classList.add("dragging")}),Ke.addEventListener("end",()=>{Hi=!1,je.domElement.classList.remove("dragging"),yt.invalidate()}),wt=tg({renderer:je,scene:ni,camera:et,controls:Ke,invalidate:()=>yt.invalidate(),initialQuality:hs.quality,deferEnvironment:!0}),je.info.autoReset=!1,Q("#quality").value=hs.quality,st.dataset.deviceProfile=hs.lightweight?"mobile":"desktop";let i=new it(new Li(16e3,16e3),$r.material(new Wt({name:"Engineering datum background",color:12765883,roughness:1})));i.rotation.x=-Math.PI/2,i.position.y=-.3,i.receiveShadow=!0,ni.add(i),Nd=i,wd(Ke,"pan"),st.dataset.dragMode="pan",Zd({invalidate:()=>{Vi(),yt.invalidate()}}),Q("#zoom-in").addEventListener("click",()=>{$c=!0,_g(.72)}),Q("#zoom-out").addEventListener("click",()=>{$c=!0,_g(1/.72)}),window.addEventListener("resize",bo),bo(),yi("all");let e=go(location.hash,zt.buildings);if(!e)try{let u=JSON.parse(localStorage.getItem("campus-view"));u&&(e=go(mo(u),zt.buildings))}catch{}e?.target&&e.position&&(yi(e.view||"all",!1),Zt.move(new C(...e.position),new C(...e.target),!1),fg=!0),await Mi(2),st.dataset.assetsReadyMs=String(Math.round(performance.now())),wt.updateShadows(),await wt.compileScene(),st.dataset.shadersReadyMs=String(Math.round(performance.now())),Eo(),si=!0,Mo=performance.now(),st.dataset.finishesReady="false",Q("#loading").style.display="none",st.dataset.readyMs=String(Math.round(performance.now())),yt.invalidate(),await Sb();let t=Promise.all(["campus-places","surroundings","reference-places","viewer-campus"].map(async u=>{let h=await fetch(cs(`/campus-map/data/processed/${u}.json`));if(!h.ok)throw Error("Dataset load failed: "+u);return h.json()})),n=(async()=>{await Promise.all([Zm(je,{mobile:hs.mobileTextures}).then(async u=>{await Xr(),$r.setTextureLibrary(u),yt.invalidate()}),hs.loadEnvironment?wt.loadEnvironment({mobile:hs.mobileTextures,beforePrepare:Xr}):(async()=>{await Xr(),wt.prepareEnvironment()})()]),je.shadowMap.needsUpdate=!0,wt.invalidateEnvironment(),yt.invalidate(),st.dataset.finishesReady="true",st.dataset.finishesReadyMs=String(Math.round(performance.now()))})().catch(u=>console.warn("\u5730\u56FE\u5DF2\u53EF\u7528\uFF0C\u7EC6\u8282\u52A0\u8F7D\u5931\u8D25\uFF1A",u)),[s,r,a,o]=await t;await Xr(),zt=o,jn=s,ii=r,jn.places.push(...og(ii,zt.buildings,jn.places)),jn.places=af(jn.places,a),jn.referenceCounts=a.counts,zt.buildings=ef(zt.buildings,jn.places),await Kd([...zt.buildings,...jn.places].map(u=>u.display_name||u.name||"")),ii?(eu=lg(ii),ni.add(eu.group)):(Q("#show-surroundings").checked=!1,Q("#show-surroundings").disabled=!0,Q('[data-search-scope="nearby"]').disabled=!0),Q("#show-surroundings").addEventListener("change",()=>{wo(),vi.constrain(),bi()}),Q("#quality").addEventListener("change",()=>{wt.setQuality(Q("#quality").value),qr=[0,0,0],bo()}),Hm({visuals:wt,exportImage:gg,invalidate:()=>{Vi(),yt.invalidate()}}),rf({controls:Ke,focus:(u,h)=>{let d=[...zt.buildings,...jn.places].find(g=>g.id===h);if(d){Id(d);return}yi("all",!1),zd({centroid:u,labelHeight:2,phase:"all",nearby:!0});let f=ii?.bounds||So;vi.setRegion([Math.min(f[0],u[0]-150),Math.min(f[1],u[1]-150),Math.max(f[2],u[0]+150),Math.max(f[3],u[1]+150)],4200)}}),xg=zm({scene:ni,camera:et,controls:Ke,visuals:wt,invalidate:()=>yt.invalidate()}),Q("#export-4k").addEventListener("click",gg),Q("#mobile-tools-toggle").onclick=()=>{let u=Q(".explore").classList.toggle("tools-expanded");Q("#mobile-tools-toggle").setAttribute("aria-expanded",String(u)),Q("#mobile-tools-toggle").setAttribute("aria-label",u?"\u6536\u8D77\u7B5B\u9009":"\u5C55\u5F00\u7B5B\u9009"),Q("#mobile-tools-toggle").title=u?"\u6536\u8D77\u7B5B\u9009":"\u5C55\u5F00\u7B5B\u9009"};for(let u of zt.buildings){let h=document.createElement("option");h.value=u.id,h.textContent=`${u.phase}\u671F \xB7 ${u.display_name||u.name}`,Q("#building").appendChild(h)}Q("#building-count").innerHTML=`${zt.stats.buildings}<small>\u5DF2\u6536\u5F55\u5EFA\u7B51\u4E0E\u6784\u7B51\u7269</small>`,document.querySelectorAll("[data-view]").forEach(u=>u.addEventListener("click",()=>{ds.scope==="nearby"&&ds.setScope("buildings"),yi(u.dataset.view)})),ds=Lm({buildings:zt.buildings,places:jn.places,camera:et,controls:Ke,stage:st,choose:Id,invalidate:()=>yt.invalidate(),onScopeChange:u=>{u==="nearby"&&Eb()},getState:()=>({view:tn,surroundingsEnabled:Q("#show-surroundings").checked,selected:Gi?.id||dn?.id,construction:Q("#construction").checked,...zn?.state})}),zn=sg({buildings:zt.buildings,placeData:jn,camera:et,controls:Ke,scene:ni,choose:Id,focusPoint:zd,restoreView:u=>{yi(u.view||"all",!1),bg(Gi),Zt.move(new C(...u.position),new C(...u.target),si)},getView:()=>({view:tn,target:Ke.target.toArray(),position:et.position.toArray(),place:Gi?.id||dn?.id||null}),applyLayers:()=>bi(),refresh:()=>ds.refresh(),invalidate:()=>yt.invalidate()}),Q("#top").addEventListener("click",Rb),Q("#reset").addEventListener("click",()=>{dn=null,ps(),$s(),yi(tn,!1)}),Q("#quick-reset").onclick=()=>Q("#reset").click(),document.querySelectorAll("button[data-drag-mode]").forEach(u=>u.addEventListener("click",()=>l(u.dataset.dragMode))),l("pan"),Q("#close-detail").addEventListener("click",()=>{dn=null,ps(),$s()}),Q("#compass").addEventListener("click",()=>{if(nn)return;let u=et.position.clone().sub(Ke.target),h=u.length(),d=Ke.getPolarAngle();u.set(0,Math.cos(d)*h,Math.sin(d)*h),Zt.move(Ke.target.clone().add(u),Ke.target)}),typeof ResizeObserver<"u"&&(new ResizeObserver(()=>Vi()).observe(Q(".explore")),new ResizeObserver(()=>Vi()).observe(Q(".detail"))),Q("#building").addEventListener("change",()=>Zr(zt.buildings.find(u=>u.id===Q("#building").value))),Q("#lod").addEventListener("change",()=>{Q("#evidence-colors").checked&&Q("#lod").value==="2"&&(Q("#lod").value="1"),Mi(iu())}),Q("#construction").addEventListener("change",()=>{!Q("#construction").checked&&dn?.construction_status==="construction_unverified"&&(dn=null,ps(),$s()),bi()}),Q("#evidence-colors").addEventListener("change",async()=>{Q("#evidence-colors").checked&&(Q("#lod").value="1",await Mi(1)),bi()}),Q("#run-qa").addEventListener("click",Ib);let c=new Set;je.domElement.addEventListener("pointerdown",u=>{c.add(u.pointerId),c.size===1?yn={x:u.clientX,y:u.clientY,id:u.pointerId,dragged:!1}:yn&&(yn.dragged=!0)}),je.domElement.addEventListener("pointermove",u=>{yn&&u.pointerId===yn.id&&Math.hypot(u.clientX-yn.x,u.clientY-yn.y)>5&&(yn.dragged=!0)}),je.domElement.addEventListener("pointerup",u=>{Cb(u),c.delete(u.pointerId),c.size||(yn=null)}),je.domElement.addEventListener("pointercancel",u=>{c.delete(u.pointerId),yn=null,je.domElement.classList.remove("dragging")}),je.domElement.addEventListener("webglcontextlost",u=>{u.preventDefault(),yt.dispose(),Jc(Error("WebGL context lost; reload to recover"))}),wo(),bi(),await zn.restore({preserveCamera:fg||$c}),Q("#run-qa").disabled=!1,yt.invalidate(),st.dataset.detailsReadyMs=String(Math.round(performance.now())),await n,st.dataset.loadTrace=JSON.stringify(performance.getEntriesByType("resource").filter(u=>/campus\.bundle|\.glb|\/materials\/|\/processed\/|\/assets\/|\/search\//.test(u.name)).map(u=>({url:new URL(u.name).pathname,start:Math.round(u.startTime),end:Math.round(u.responseEnd),bytes:u.transferSize})))}catch(i){si?(console.warn("\u5730\u56FE\u5DF2\u53EF\u7528\uFF0C\u5730\u70B9\u8D44\u6599\u6682\u672A\u8865\u9F50\uFF1A",i),Bd.textContent="\u5730\u56FE\u5DF2\u6253\u5F00\uFF0C\u5730\u70B9\u8D44\u6599\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u5237\u65B0\u91CD\u8BD5"):Jc(i)}}var Sg=i=>parent.postMessage(i,location.origin),Lb=Zr;Zr=function(i,e=!0){Lb(i,e),i&&Sg({type:"huitongli-map-selected",id:i.id})};window.addEventListener("message",i=>{i.origin!==location.origin||i.source!==parent||i.data?.type!=="huitongli-map-command"||!si||(i.data.action==="focus"&&Zr(zt.buildings.find(e=>e.id===i.data.id)),i.data.action==="overview"&&(dn=null,ps(),$s(),yi("all",!1)))});Db().then(()=>{si&&Sg({type:"huitongli-map-ready",buildings:[{id:"way/1081327620",name:"V29 \u5BB9\u95F3\u697C"},{id:"way/1201625876",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625876"},{id:"way/1201625882",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625882"},{id:"way/1201625883",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625883"},{id:"way/1202303549",name:"\u672A\u547D\u540D\u5EFA\u7B51 1202303549"},{id:"way/1206553328",name:"\u672A\u547D\u540D\u5EFA\u7B51 1206553328"},{id:"way/1206553329",name:"\u672A\u547D\u540D\u5EFA\u7B51 1206553329"},{id:"way/1215697328",name:"\u672A\u547D\u540D\u5EFA\u7B51 1215697328"},{id:"way/1215983507",name:"\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3\uFF08\u4E00\u671F\uFF09"},{id:"way/664082908",name:"T2 \u4EBA\u6587\u697C"},{id:"way/664082909",name:"T3 \u683C\u7269\u697C"},{id:"way/664082910",name:"T1 \u539A\u5FB7\u697C"},{id:"way/664082911",name:"\u6F14\u827A\u5385"},{id:"way/664082912",name:"\u884C\u653F\u697C"},{id:"way/664082913",name:"\u5927\u5B66\u4F1A\u5802"},{id:"way/664082915",name:"\u4F53\u80B2\u9986"},{id:"way/664093255",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093255"},{id:"way/664093256",name:"T4 \u6559\u5B66\u697C"},{id:"way/664093257",name:"T5 \u6559\u5B66\u697C"},{id:"way/664093258",name:"T6 \u6559\u5B66\u697C"},{id:"way/664093260",name:"T7 \u6559\u5B66\u697C"},{id:"way/664093261",name:"T8 \u535A\u7B80\u697C"},{id:"way/664093272",name:"V28 \u838E\u7FC1\u697C"},{id:"way/664093273",name:"V27 \u96E8\u679C\u697C"},{id:"way/664093274",name:"\u6986\u6808"},{id:"way/664093275",name:"V26 \u6B4C\u5FB7\u697C"},{id:"way/664093276",name:"V25 \u4E1C\u5761\u697C"},{id:"way/664093277",name:"V23 \u96EA\u82B9\u697C"},{id:"way/664093278",name:"V24 \u9633\u660E\u697C"},{id:"way/664093279",name:"\u4F1A\u8D24\u90A8\u5F85\u6838\u4F4E\u5C42\u8F6E\u5ED3"},{id:"way/664093280",name:"V20 \u7B03\u884C\u697C"},{id:"way/664093281",name:"V19 \u771F\u77E5\u697C"},{id:"way/664093282",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093282"},{id:"way/664093283",name:"V21 \u535A\u6587\u697C"},{id:"way/664093284",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093284"},{id:"way/664093285",name:"V22 \u96C5\u5FD7\u697C"},{id:"way/664093286",name:"V18 \u62B1\u6734\u697C"},{id:"way/664093287",name:"V17 \u4EC1\u7231\u697C"},{id:"way/664093288",name:"V16 \u5C1A\u8D24\u697C"},{id:"way/664093289",name:"V15 \u660E\u5FC3\u697C"},{id:"way/664093290",name:"\u6587\u5316\u521B\u610F\u7FA4\u843D"},{id:"way/664093294",name:"T29 \u6559\u5B66\u697C"},{id:"relation/16121437",name:"D3 \u4E50\u96C5\u82D1"},{id:"relation/16121438",name:"D4"},{id:"relation/16121439",name:"D1 \u96CD\u96C5\u82D1"},{id:"relation/16121440",name:"D2"},{id:"relation/16123936",name:"D6 \u6B63\u96C5\u82D1"},{id:"relation/16123937",name:"D5 \u5B8F\u96C5\u82D1"},{id:"relation/18706867",name:"\u672A\u547D\u540D\u5EFA\u7B51 18706867"},{id:"relation/19666480",name:"\u672A\u547D\u540D\u5EFA\u7B51 19666480"},{id:"relation/19971851",name:"\u672A\u547D\u540D\u5EFA\u7B51 19971851"},{id:"relation/19971852",name:"\u672A\u547D\u540D\u5EFA\u7B51 19971852"},{id:"way/1191618600",name:"\u9AD8\u7B49\u7814\u7A76\u9662"},{id:"way/1191618603",name:"\u672A\u547D\u540D\u5EFA\u7B51 1191618603"},{id:"way/1209647875",name:"\u672A\u547D\u540D\u5EFA\u7B51 1209647875"},{id:"way/1384048510",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048510"},{id:"way/1384048511",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048511"},{id:"way/1384048512",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048512"},{id:"way/1384048513",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048513"},{id:"way/1384048514",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048514"},{id:"way/1384101157",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101157"},{id:"way/1384101158",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101158"},{id:"way/1384101159",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101159"},{id:"way/1384101160",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101160"},{id:"way/1384101161",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101161"},{id:"way/1388933765",name:"\u672A\u547D\u540D\u5EFA\u7B51 1388933765"},{id:"way/1434554451",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554451"},{id:"way/1434554454",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554454"},{id:"way/1434554455",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554455"},{id:"way/1434554456",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554456"},{id:"way/1434554457",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554457"},{id:"way/1446422779",name:"\u672A\u547D\u540D\u5EFA\u7B51 1446422779"},{id:"way/1446422780",name:"\u672A\u547D\u540D\u5EFA\u7B51 1446422780"},{id:"way/1459082762",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459082762"},{id:"way/1459105110",name:"\u4E1C\u5927\u95E8"},{id:"way/1459105119",name:"\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3\uFF08\u4E8C\u671F\uFF09"},{id:"way/1459105120",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105120"},{id:"way/1459105121",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105121"},{id:"way/1459105140",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105140"}]})});
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
