var Jd={road:"M7 3 3 21M17 3l4 18M12 3v4M12 10v4M12 17v4",dining:"M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 3c-3 4-3 8 1 8h1M19 3v18",shop:"M4 9v12h16V9M3 9l2-6h14l2 6M3 9c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0M9 21v-7h6v7",bus:"M6 3h12a2 2 0 0 1 2 2v13H4V5a2 2 0 0 1 2-2ZM4 11h16M7 15h1M16 15h1M7 18v3M17 18v3",medical:"M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z",leaf:"M20 3C8 2 2 7 5 15c3 8 17 5 15-12ZM4 21 16 9",culture:"m3 8 9-5 9 5ZM5 10v9M10 10v9M14 10v9M19 10v9M3 21h18",gate:"M4 21V3h16v18M8 21V7h8v14M2 21h20",water:"M2 8q3-4 6 0t6 0 6 0M2 13q3-4 6 0t6 0 6 0M2 18q3-4 6 0t6 0 6 0",search:"M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",pin:"M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0",plus:"M12 5v14M5 12h14",minus:"M5 12h14",close:"m6 6 12 12M18 6 6 18",star:"m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z",share:"M15 3h6v6M21 3 10 14M11 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6",comment:"M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2.5-4a8.5 8.5 0 1 1 15.5-4.5ZM8 10h8M8 14h5",location:"M12 2v3M12 19v3M2 12h3M19 12h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",north:"m12 3 6 17-6-4-6 4Z",fullscreen:"M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5",layers:"m12 3 10 6-10 6L2 9ZM2 13l10 6 10-6M2 17l10 6 10-6",top:"M4 4h16v16H4ZM4 9h16M9 9v11",reset:"M3 10a9 9 0 1 1 1 7M3 4v6h6",hand:"M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v7c0 5-3 8-7 8-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2",rotate:"M4 9a8 8 0 0 1 14-4l3 3M21 3v5h-5M20 15a8 8 0 0 1-14 4l-3-3M3 21v-5h5",sun:"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",more:"M5 11v2M12 11v2M19 11v2",filter:"M4 7h16M4 17h16M8 4v6M16 14v6",building:"M4 21V3h12v18M16 9h4v12M8 7h4M8 11h4M8 15h4M2 21h20",arrow:"M5 12h14m-5-5 5 5-5 5"};function Qs(i){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.classList.add("ui-icon");for(let[n,s]of Object.entries({viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"}))e.setAttribute(n,s);let t=document.createElementNS(e.namespaceURI,"path");return t.setAttribute("d",Jd[i]||Jd.pin),e.append(t),e}function nn(i,e,t){if(i.replaceChildren(Qs(e)),t){let n=document.createElement("span");n.textContent=t,i.append(n)}return i}function Qd(i=document){i.querySelectorAll("[data-ui-icon]").forEach(e=>{e.querySelector(".ui-icon")||e.prepend(Qs(e.dataset.uiIcon))})}function ef({invalidate:i}){Qd();let e=document.querySelector("#map-settings-dialog"),t=document.querySelector("#open-map-settings");t.addEventListener("click",()=>{e.showModal(),t.setAttribute("aria-expanded","true")}),document.querySelector("#close-map-settings").addEventListener("click",()=>e.close()),e.addEventListener("close",()=>{t.setAttribute("aria-expanded","false"),i()}),e.addEventListener("click",n=>{if(n.target===e){let s=e.getBoundingClientRect();(n.clientX<s.left||n.clientX>s.right||n.clientY<s.top||n.clientY>s.bottom)&&e.close()}}),document.querySelector("#open-reference-map").addEventListener("click",()=>e.close()),document.querySelector("#place-filters").addEventListener("toggle",i)}function cu(){let i=document.querySelector("#stage");if(i.clientWidth>760&&i.clientHeight>500)return;document.querySelector("#building-search").blur(),document.querySelector(".explore").classList.remove("tools-expanded");let e=document.querySelector("#mobile-tools-toggle");e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label","\u5C55\u5F00\u7B5B\u9009"),e.title="\u5C55\u5F00\u7B5B\u9009"}var Lo={"102\u4E61\u9053":["102xiangdao","102xd"],"104\u4E61\u9053":["104xiangdao","104xd"],"1762s":["1762s","1762s"],"68\u70E7\u70E4\u58EB\u591A":["68shaokaoshiduo","68sksd"],"7-Eleven":["7-Eleven","7-Eleven"],"7\u4E2A\u5821\xB7\u7099\u70E4\u725B\u8089\u6C49\u5821\uFF08\u91D1\u9F0E\u5B81\u5802\u5E97\uFF09":["7gebao\xB7zhikaoniurouhanbao\uFF08jindingningtangdian\uFF09","7gb\xB7zknrhb\uFF08jdntd\uFF09"],"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668":["AED zidongtiwaichuchanqi","AED zdtwccq"],"Apple\u6388\u6743\u4E13\u8425\u5E97\uFF08\u950B\u4E3A\u73E0\u6D77\u9999\u6D32\u9AD8\u65B0\u5B9D\u9F99\u5E7F\u573A\u5E97\uFF09":["Appleshouquanzhuanyingdian\uFF08fengweizhuhaixiangzhougaoxinbaolongguangchangdian\uFF09","Applesqzyd\uFF08fwzhxzgxblgcd\uFF09"],CV\u81EA\u9009\u9910:["CVzixuancan","CVzxc"],"D1 \u96CD\u96C5\u82D1":["D1 yongyayuan","D1 yyy"],D2:["D2","D2"],"D3 \u4E50\u96C5\u82D1":["D3 leyayuan","D3 lyy"],D4:["D4","D4"],"D5 \u5B8F\u96C5\u82D1":["D5 hongyayuan","D5 hyy"],"D6 \u6B63\u96C5\u82D1":["D6 zhengyayuan","D6 zyy"],"MU \u745C\u4F3D\xB7\u666E\u62C9\u63D0":["MU yujia\xB7pulati","MU yj\xB7plt"],"Main Library":["Main Library","Main Library"],"T1 \u539A\u5FB7\u697C":["T1 houdelou","T1 hdl"],"T2 \u4EBA\u6587\u697C":["T2 renwenlou","T2 rwl"],"T29 \u6559\u5B66\u697C":["T29 jiaoxuelou","T29 jxl"],"T3 \u683C\u7269\u697C":["T3 gewulou","T3 gwl"],"T4 \u6559\u5B66\u697C":["T4 jiaoxuelou","T4 jxl"],"T5 \u6559\u5B66\u697C":["T5 jiaoxuelou","T5 jxl"],"T6 \u6559\u5B66\u697C":["T6 jiaoxuelou","T6 jxl"],"T7 \u6559\u5B66\u697C":["T7 jiaoxuelou","T7 jxl"],"T8 \u535A\u7B80\u697C":["T8 bojianlou","T8 bjl"],UGYM:["UGYM","UGYM"],"UIC \u4F11\u95F2\u5C0F\u6808":["UIC xiuxianxiaozhan","UIC xxxz"],"UIC \u9AD8\u7B49\u7814\u7A76\u9662":["UIC gaodengyanjiuyuan","UIC gdyjy"],"UIC\u5B66\u9662\uFF08\u6587\u521B\u697C\uFF09":["UICxueyuan\uFF08wenchuanglou\uFF09","UICxy\uFF08wcl\uFF09"],"V15 \u660E\u5FC3\u697C":["V15 mingxinlou","V15 mxl"],"V16 \u5C1A\u8D24\u697C":["V16 shangxianlou","V16 sxl"],"V17 \u4EC1\u7231\u697C":["V17 renailou","V17 ral"],"V18 \u62B1\u6734\u697C":["V18 baopulou","V18 bpl"],"V19 \u771F\u77E5\u697C":["V19 zhenzhilou","V19 zzl"],"V20 \u7B03\u884C\u697C":["V20 duxinglou","V20 dxl"],"V21 \u535A\u6587\u697C":["V21 bowenlou","V21 bwl"],"V22 \u96C5\u5FD7\u697C":["V22 yazhilou","V22 yzl"],"V23 \u96EA\u82B9\u697C":["V23 xueqinlou","V23 xql"],"V24 \u9633\u660E\u697C":["V24 yangminglou","V24 yml"],"V25 \u4E1C\u5761\u697C":["V25 dongpolou","V25 dpl"],"V26 \u6B4C\u5FB7\u697C":["V26 gedelou","V26 gdl"],"V27 \u96E8\u679C\u697C":["V27 yuguolou","V27 ygl"],"V28 \u838E\u7FC1\u697C":["V28 shawenglou","V28 swl"],"V29 \u5BB9\u95F3\u697C":["V29 ronghonglou","V29 rhl"],WOW\u51B0\u5BA4:["WOWbingshi","WOWbs"],Yo\u5065\u5EB7\u6599\u7406:["Yojiankangliaoli","Yojkll"],i\u679C\u9C9C\u5207:["iguoxianqie","igxq"],"mr. wu \u5364\u8089\u5377":["mr. wu luroujuan","mr. wu lrj"],\u4E00\u516D\u516B\u533B\u9662:["yiliubayiyuan","ylbyy"],\u4E00\u70B9\u70B9:["yidiandian","ydd"],\u4E07\u901A\u8D85\u5E02:["wantongchaoshi","wtcs"],\u4E09\u671F\u7403\u573A:["sanqiqiuchang","sqqc"],\u4E09\u6D25\u6C64\u5305:["sanjintangbao","sjtb"],\u4E0A\u6805:["shangshan","ss"],\u4E0B\u67F5:["xiashan","xs"],\u4E0B\u6805:["xiashan","xs"],\u4E0B\u6805\u793E\u533A:["xiashanshequ","xssq"],\u4E1C\u5317\u4EBA\u5BB6:["dongbeirenjia","dbrj"],\u4E1C\u5317\u5473\u9053\u70E7\u70E4\u5C4B:["dongbeiweidaoshaokaowu","dbwdskw"],\u4E1C\u5317\u963F\u9F99\u70E7\u70E4\u5427:["dongbeialongshaokaoba","dbalskb"],\u4E1C\u5927\u95E8:["dongdamen","ddm"],\u4E2D\u548C:["zhonghe","zh"],\u4E2D\u56FD\u519C\u4E1A\u94F6\u884C:["zhongguonongyeyinhang","zgnyyh"],"\u4E2D\u56FD\u519C\u4E1A\u94F6\u884C ATM":["zhongguonongyeyinhang ATM","zgnyyh ATM"],\u4E2D\u56FD\u7535\u4FE1:["zhongguodianxin","zgdx"],\u4E2D\u56FD\u77F3\u5316:["zhongguoshihua","zgsh"],\u4E2D\u56FD\u79FB\u52A8:["zhongguoyidong","zgyd"],\u4E2D\u56FD\u8054\u901A:["zhongguoliantong","zglt"],\u4E2D\u5FC3\u6E56:["zhongxinhu","zxh"],\u4E2D\u73E0\u6E20\u5357\u8DEF:["zhongzhuqunanlu","zzqnl"],\u4E2D\u76C8\u9910\u5385:["zhongyingcanting","zyct"],\u4E2D\u7F8E\u56FD\u9645\u5B66\u9662:["zhongmeiguojixueyuan","zmgjxy"],\u4E30\u5DE2:["fengchao","fc"],\u4E3D\u6CFD\u4E1C\u8DEF:["lizedonglu","lzdl"],\u4E3D\u6CFD\u5730\u4E0B\u505C\u8F66\u573A:["lizedixiatingchechang","lzdxtcc"],\u4E3D\u6CFD\u697C:["lizelou","lzl"],\u4E3D\u6CFD\u697CA\u680B:["lizelouAdong","lzlAd"],\u4E3D\u6CFD\u697CB\u680B:["lizelouBdong","lzlBd"],\u4E3D\u6CFD\u697CC\u680B:["lizelouCdong","lzlCd"],\u4E3D\u6CFD\u6E56:["lizehu","lzh"],\u4E50\u80B2\u697C:["leyulou","lyl"],\u4E61\u60C5\u9986:["xiangqingguan","xqg"],\u4E66\u4EA6\u70E7\u4ED9\u8349:["shuyishaoxiancao","sysxc"],\u4E66\u5C71\u8DEF:["shushanlu","ssl"],\u4E66\u97F5\u4E00\u8DEF:["shuyunyilu","syyl"],\u4E66\u97F5\u4E8C\u8DEF:["shuyunerlu","syel"],\u4E91\u5357\u7C73\u7EBF:["yunnanmixian","ynmx"],\u4E91\u6E58\u5473:["yunxiangwei","yxw"],\u4EAC\u534E\u82D11\u680B:["jinghuayuan1dong","jhy1d"],\u4EAC\u534E\u82D12\u680B:["jinghuayuan2dong","jhy2d"],\u4EAC\u534E\u82D13\u680B:["jinghuayuan3dong","jhy3d"],\u4EAC\u534E\u82D14\u680B:["jinghuayuan4dong","jhy4d"],\u4EAC\u534E\u82D15\u680B:["jinghuayuan5dong","jhy5d"],\u4EAC\u5E08\u5BB6\u56ED:["jingshijiayuan","jsjy"],\u4EAC\u5E08\u5BB6\u56ED11\u680B:["jingshijiayuan11dong","jsjy11d"],\u4EAC\u5E08\u5BB6\u56ED12\u680B:["jingshijiayuan12dong","jsjy12d"],\u4EAC\u5E08\u5BB6\u56ED13\u680B:["jingshijiayuan13dong","jsjy13d"],\u4EAC\u5E08\u5BB6\u56ED14\u680B:["jingshijiayuan14dong","jsjy14d"],\u4EAC\u5E08\u5BB6\u56ED15\u680B:["jingshijiayuan15dong","jsjy15d"],\u4EAC\u5E08\u5BB6\u56ED16\u680B:["jingshijiayuan16dong","jsjy16d"],\u4EAC\u5E08\u5BB6\u56ED17\u680B:["jingshijiayuan17dong","jsjy17d"],\u4EAC\u5E08\u5BB6\u56ED18\u680B:["jingshijiayuan18dong","jsjy18d"],\u4EAC\u5E08\u5BB6\u56ED19\u680B:["jingshijiayuan19dong","jsjy19d"],\u4EAC\u5E08\u5BB6\u56ED1\u680B:["jingshijiayuan1dong","jsjy1d"],\u4EAC\u5E08\u5BB6\u56ED20\u680B:["jingshijiayuan20dong","jsjy20d"],\u4EAC\u5E08\u5BB6\u56ED21\u680B:["jingshijiayuan21dong","jsjy21d"],\u4EAC\u5E08\u5BB6\u56ED22\u680B:["jingshijiayuan22dong","jsjy22d"],\u4EAC\u5E08\u5BB6\u56ED23\u680B:["jingshijiayuan23dong","jsjy23d"],\u4EAC\u5E08\u5BB6\u56ED24\u680B:["jingshijiayuan24dong","jsjy24d"],\u4EAC\u5E08\u5BB6\u56ED25\u680B:["jingshijiayuan25dong","jsjy25d"],\u4EAC\u5E08\u5BB6\u56ED2\u680B:["jingshijiayuan2dong","jsjy2d"],\u4EAC\u5E08\u5BB6\u56ED3\u680B:["jingshijiayuan3dong","jsjy3d"],\u4EAC\u5E08\u5BB6\u56ED4\u680B:["jingshijiayuan4dong","jsjy4d"],\u4EAC\u5E08\u5BB6\u56ED6\u680B:["jingshijiayuan6dong","jsjy6d"],\u4EAC\u5E08\u5BB6\u56ED7\u680B:["jingshijiayuan7dong","jsjy7d"],\u4EAC\u5E08\u5BB6\u56ED\u5165\u53E3:["jingshijiayuanrukou","jsjyrk"],\u4ECA\u96E8\u8F69:["jinyuxuan","jyx"],\u4F11\u606F\u5EA7\u6905:["xiuxizuoyi","xxzy"],\u4F11\u95F2\u8BBE\u65BD:["xiuxiansheshi","xxss"],"\u4F18\u521B\u7CBE\u9009 \u897F\u5F0F\u65E9\u70B9":["youchuangjingxuan xishizaodian","ycjx xszd"],\u4F18\u6CF0\u79D1\u6280:["youtaikeji","ytkj"],\u4F18\u7231\u9910\u5385:["youaicanting","yact"],\u4F18\u8863\u5E93:["youyiku","yyk"],"\u4F1A\u5357\u4E00\u8857\uFF08\u89C4\u5212\uFF09":["huinanyijie\uFF08guihua\uFF09","hnyj\uFF08gh\uFF09"],\u4F1A\u5357\u4E09\u8857:["huinansanjie","hnsj"],"\u4F1A\u5357\u4E8C\u8857\uFF08\u89C4\u5212\u540D\uFF09":["huinanerjie\uFF08guihuaming\uFF09","hnej\uFF08ghm\uFF09"],\u4F1A\u540C:["huitong","ht"],\u4F1A\u540C\u4E66\u9662:["huitongshuyuan","htsy"],\u4F1A\u540C\u4F53\u80B2\u516C\u56ED:["huitongtiyugongyuan","httygy"],\u4F1A\u540C\u5317\u8DEF:["huitongbeilu","htbl"],\u4F1A\u540C\u5317\u8DEF\u5317:["huitongbeilubei","htblb"],\u4F1A\u540C\u5317\u8DEF\u5357:["huitongbeilunan","htbln"],\u4F1A\u540C\u5357\u8DEF:["huitongnanlu","htnl"],\u4F1A\u540C\u5357\u8DEF\u4E2D:["huitongnanluzhong","htnlz"],\u4F1A\u540C\u5357\u8DEF\u5317:["huitongnanlubei","htnlb"],\u4F1A\u540C\u5357\u8DEF\u5357:["huitongnanlunan","htnln"],\u4F1A\u540C\u53E4\u6751:["huitonggucun","htgc"],\u4F1A\u540C\u591C\u5E02:["huitongyeshi","htys"],\u4F1A\u540C\u5C71\u6C34\u519C\u5E84:["huitongshanshuinongzhuang","htssnz"],\u4F1A\u540C\u67512\u53F7\u505C\u8F66\u573A:["huitongcun2haotingchechang","htc2htcc"],\u4F1A\u540C\u67513\u53F7\u505C\u8F66\u573A:["huitongcun3haotingchechang","htc3htcc"],\u4F1A\u540C\u793E\u533A\u515A\u7FA4\u670D\u52A1\u4E2D\u5FC3:["huitongshequdangqunfuwuzhongxin","htsqdqfwzx"],\u4F1A\u540C\u7F09\u537F\u4EAD:["huitongjiqingting","htjqt"],\u4F1A\u540C\u8015\u8BFB\u793E:["huitonggengdushe","htgds"],\u4F1A\u540C\u8DEF:["huitonglu","htl"],\u4F1A\u540C\u8DEF\u53E3:["huitonglukou","htlk"],\u4F1A\u540C\u98DF\u8857:["huitongshijie","htsj"],"\u4F1A\u540C\u9A7F\u7AD9;\u4F1A\u540C\u6E38\u5BA2\u670D\u52A1\u4E2D\u5FC3":["huitongyizhan;huitongyoukefuwuzhongxin","htyz;htykfwzx"],\u4F1A\u6B63\u8857:["huizhengjie","hzj"],\u4F1A\u8BA1\u4E0E\u91D1\u878D\u5B66\u9662:["kuaijiyujinrongxueyuan","kjyjrxy"],\u4F1A\u8D24\u90A8\u5E7F\u573A:["huixiancunguangchang","hxcgc"],\u4F1A\u8D24\u90A8\u5F85\u6838\u4F4E\u5C42\u8F6E\u5ED3:["huixiancundaihedicenglunkuo","hxcdhdclk"],\u4F34\u98FD:["banbao","bb"],\u4F53\u80B2\u4E2D\u5FC3:["tiyuzhongxin","tyzx"],\u4F53\u80B2\u516C\u56ED:["tiyugongyuan","tygy"],\u4F53\u80B2\u573A:["tiyuchang","tyc"],\u4F53\u80B2\u8DEF:["tiyulu","tyl"],\u4F53\u80B2\u9986:["tiyuguan","tyg"],\u4F5B\u5F84:["fojing","fj"],\u4FDD\u536B\u5BA4:["baoweishi","bws"],\u4FE1\u606F\u5B66\u9662:["xinxixueyuan","xxxy"],\u4FE1\u606F\u79D1\u6280\u4E0E\u670D\u52A1\u4E2D\u5FC3:["xinxikejiyufuwuzhongxin","xxkjyfwzx"],\u505C\u8F66\u573A:["tingchechang","tcc"],\u505C\u8F66\u573A\u5165\u53E3:["tingchechangrukou","tccrk"],\u513F\u7AE5\u535A\u7269\u9986:["ertongbowuguan","etbwg"],\u5143\u767D\u697C:["yuanbailou","ybl"],\u5145\u7535\u7AD9:["chongdianzhan","cdz"],\u516B\u722A\u9C7C\u5BFF\u53F8:["bazhuayushousi","bzyss"],\u516C\u4EA4\u4E34\u65F6\u7AD9:["gongjiaolinshizhan","gjlsz"],\u516C\u4EA4\u62DB\u547C\u7AD9:["gongjiaozhaohuzhan","gjzhz"],\u516C\u4EA4\u7AD9:["gongjiaozhan","gjz"],\u516C\u56ED:["gongyuan","gy"],\u5170\u5DDE\u62C9\u9762:["lanzhoulamian","lzlm"],\u5170\u5DDE\u725B\u8089\u9762:["lanzhouniuroumian","lznrm"],\u5171\u4E50\u4EAD:["gongleting","glt"],\u5173\u4E1C\u4EBA\u5BB6:["guandongrenjia","gdrj"],\u51E4\u51F0\u8DEF:["fenghuanglu","fhl"],\u51FA\u5165\u53E3:["churukou","crk"],\u51FA\u79DF\u8F66\u505C\u8F66\u7AD9:["chuzuchetingchezhan","czctcz"],\u5218\u798F\u8BB0:["liufuji","lfj"],\u521B\u5BA2\u4E2D\u5FC3:["chuangkezhongxin","ckzx"],\u521B\u65B0\u4E00\u8DEF\u5357:["chuangxinyilunan","cxyln"],\u521B\u65B0\u4E00\u8DEF\u53E3:["chuangxinyilukou","cxylk"],\u521B\u65B0\u53D1\u5C55\u5927\u53A6:["chuangxinfazhandasha","cxfzds"],\u521B\u667A\u8DEF:["chuangzhilu","czl"],\u521D\u9009:["chuxuan","cx"],\u52B1\u6559\u697C:["lijiaolou","ljl"],\u52B1\u8018\u505C\u8F66\u573A:["liyuntingchechang","lytcc"],\u52B1\u8018\u697C:["liyunlou","lyl"],\u52B1\u8018\u8857:["liyunjie","lyj"],\u52B1\u81F4\u516C\u53F8:["lizhigongsi","lzgs"],"\u5317\u4EAC\u5E08\u8303\u5927\u5B66(\u73E0\u6D77\u6821\u533A)":["beijingshifandaxue(zhuhaixiaoqu)","bjsfdx(zhxq)"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u4E50\u80B2\u4E66\u9662:["beijingshifandaxueleyushuyuan","bjsfdxlysy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u4F1A\u540C\u4E66\u9662:["beijingshifandaxuehuitongshuyuan","bjsfdxhtsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u56FD\u5BB6\u5B89\u5168\u4E0E\u5E94\u6025\u7BA1\u7406\u5B66\u9662:["beijingshifandaxueguojiaanquanyuyingjiguanlixueyuan","bjsfdxgjaqyyjglxy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u5F18\u6587\u4E66\u9662:["beijingshifandaxuehongwenshuyuan","bjsfdxhwsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u672A\u6765\u8BBE\u8BA1\u5B66\u9662:["beijingshifandaxueweilaishejixueyuan","bjsfdxwlsjxy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u5206\u6821\u9644\u5C5E\u5916\u56FD\u8BED\u5B66\u6821:["beijingshifandaxuezhuhaifenxiaofushuwaiguoyuxuexiao","bjsfdxzhfxfswgyxx"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u5B9E\u9A8C\u5E7C\u513F\u56ED:["beijingshifandaxuezhuhaishiyanyoueryuan","bjsfdxzhsyyey"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u73E0\u6D77\u6821\u533A\u6E38\u6CF3\u9986:["beijingshifandaxuezhuhaixiaoquyouyongguan","bjsfdxzhxqyyg"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u77E5\u884C\u4E66\u9662:["beijingshifandaxuezhixingshuyuan","bjsfdxzxsy"],\u5317\u4EAC\u5E08\u8303\u5927\u5B66\u783A\u884C\u4E66\u9662:["beijingshifandaxuelixingshuyuan","bjsfdxlxsy"],"\u5317\u4EAC\u7406\u5DE5\u5927\u5B66(\u73E0\u6D77)":["beijingligongdaxue(zhuhai)","bjlgdx(zh)"],\u5317\u4EAC\u7406\u5DE5\u5927\u5B66\u5927\u6E7E\u533A\u521B\u65B0\u7814\u7A76\u9662:["beijingligongdaxuedawanquchuangxinyanjiuyuan","bjlgdxdwqcxyjy"],"\u5317\u4EAC\u7406\u5DE5\u5927\u5B66\u9644\u5C5E\u5B9E\u9A8C\u5B66\u6821(\u73E0\u6D77)":["beijingligongdaxuefushushiyanxuexiao(zhuhai)","bjlgdxfssyxx(zh)"],\u5317\u5E08\u5927\u9644\u4E2D\u8DEF:["beishidafuzhonglu","bsdfzl"],\u5317\u5E08\u5927\u9AD8\u5C14\u592B\u7403\u573A:["beishidagaoerfuqiuchang","bsdgefqc"],\u5317\u5E08\u7F51\u7403\u573A:["beishiwangqiuchang","bswqc"],\u5317\u5E08\u9999\u6E2F\u6D78\u4F1A\u5927\u5B66:["beishixianggangjinhuidaxue","bsxgjhdx"],\u5317\u65B9\u624B\u5DE5\u6C34\u997A:["beifangshougongshuijiao","bfsgsj"],\u5317\u7406\u5DE5:["beiligong","blg"],"\u5317\u7406\u73E0 \u7FBD\u4E52\u7403\u9986":["beilizhu yupingqiuguan","blz ypqg"],\u5317\u7406\u73E0\u56FE\u4E66\u9986:["beilizhutushuguan","blztsg"],\u5317\u7406\u73E0\u6E05\u771F\u98DF\u5802:["beilizhuqingzhenshitang","blzqzst"],\u5317\u7406\u73E0\u7B2C\u4E00\u98DF\u5802:["beilizhudiyishitang","blzdyst"],\u5317\u7406\u73E0\u7B2C\u4E09\u98DF\u5802:["beilizhudisanshitang","blzdsst"],\u5317\u7406\u73E0\u7B2C\u4E8C\u98DF\u5802:["beilizhudiershitang","blzdest"],\u5317\u7406\u73E0\u7B2C\u56DB\u98DF\u5802:["beilizhudisishitang","blzdsst"],\u5317\u7406\u73E0\u946B\u8302\u9910\u5385:["beilizhuxinmaocanting","blzxmct"],\u533B\u52A1\u5BA4:["yiwushi","yws"],\u533B\u7597:["yiliao","yl"],\u533B\u7597\u53CA\u5065\u5EB7\u6559\u80B2\u4E2D\u5FC3:["yiliaojijiankangjiaoyuzhongxin","yljjkjyzx"],\u534E\u51A0\u5DE5\u4E1A\u56ED:["huaguangongyeyuan","hggyy"],\u534E\u51A0\u8DEF:["huaguanlu","hgl"],\u53571\u95E8:["nan1men","n1m"],\u53572\u95E8:["nan2men","n2m"],\u53573\u95E8:["nan3men","n3m"],\u53574\u95E8:["nan4men","n4m"],\u53575\u95E8:["nan5men","n5m"],\u5357\u5C71:["nanshan","ns"],\u5357\u66E6\u56ED:["nanxiyuan","nxy"],\u5364\u5473\u719F\u98DF:["luweishushi","lwss"],\u539F\u5473\u732A\u6742\u6C64\u996D:["yuanweizhuzatangfan","ywzztf"],\u53CC\u9F99:["shuanglong","sl"],\u53CC\u9F99\u6751\u53E3:["shuanglongcunkou","slck"],\u53D1\u8FBE\u732B:["fadamao","fdm"],\u53E4\u5143\u5927\u5B97\u7960:["guyuandazongci","gydzc"],\u53E4\u5143\u6545\u5C45:["guyuanguju","gygj"],\u53E4\u5143\u6587\u5316\u5E7F\u573A:["guyuanwenhuaguangchang","gywhgc"],"\u53E4\u6625\u5802 \u51C9\u8336\u7CD6\u6C34\u94FA":["guchuntang liangchatangshuipu","gct lctsp"],\u53E4\u6751\u519C\u5E84:["gucunnongzhuang","gcnz"],\u53E4\u6C0F\u5927\u5B97\u7960:["gushidazongci","gsdzc"],\u53E4\u97F5\u8DEF:["guyunlu","gyl"],\u53FB\u9CA8\u671D:["leshachao","lsc"],"\u5409\u7965 \u9EBB\u8FA3\u70EB":["jixiang malatang","jx mlt"],\u540C\u5FC3\u6CE5\u70E9\u9E21:["tongxinnihuiji","txnhj"],\u540D\u56FE\u79D1\u6280:["mingtukeji","mtkj"],\u5434\u6E05\u8F89\u4F09\u4FEA\u6F14\u827A\u5385:["wuqinghuikangliyanyiting","wqhklyyt"],\u543E\u5BB6\u5192\u83DC\u9986:["wujiamaocaiguan","wjmcg"],\u5473\u65CB\u5F8B:["weixuanl\xFC","wxl"],"\u5473\u6B63\u9999 \u81EA\u9009\u5957\u9910":["weizhengxiang zixuantaocan","wzx zxtc"],\u548C\u97F5\u4E00\u8DEF:["heyunyilu","hyyl"],\u548C\u97F5\u4E8C\u8DEF:["heyunerlu","hyel"],\u548C\u98CE\u62C9\u9762:["hefenglamian","hflm"],\u5510\u5BB6\u6E7E:["tangjiawan","tjw"],\u5510\u5BB6\u6E7E\u9547:["tangjiawanzhen","tjwz"],\u5546\u5B66\u9662:["shangxueyuan","sxy"],\u559C\u8BB0\u4E91\u997A:["xijiyunjiao","xjyj"],\u56ED\u533A\u670D\u52A1\u4E2D\u5FC3:["yuanqufuwuzhongxin","yqfwzx"],\u56FD\u5174\u4FBF\u5229\u5E97:["guoxingbianlidian","gxbld"],\u56FD\u9645\u4EA4\u6D41\u4E2D\u5FC3:["guojijiaoliuzhongxin","gjjlzx"],\u56FD\u9645\u53D1\u5C55\u5904:["guojifazhanchu","gjfzc"],\u5783\u573E\u4E2D\u8F6C\u7AD9:["lajizhongzhuanzhan","ljzzz"],\u5783\u573E\u56DE\u6536\u70B9:["lajihuishoudian","ljhsd"],\u5783\u573E\u6876:["lajitong","ljt"],\u57CE\u8F68\u5510\u5BB6\u6E7E\u7AD9:["chengguitangjiawanzhan","cgtjwz"],\u5854\u65AF\u6C40\u4E2D\u56FD\u6C49\u5821:["tasitingzhongguohanbao","tstzghb"],\u58F9\u53F7:["yihao","yh"],\u5916\u56FD\u8BED\u5B66\u9662:["waiguoyuxueyuan","wgyxy"],\u591A\u8BB0\u751C\u54C1:["duojitianpin","djtp"],"\u5927\u4F17\u81EA\u9009 \u4E2D\u5F0F\u65E9\u9910":["dazhongzixuan zhongshizaocan","dzzx zszc"],\u5927\u540C:["datong","dt"],\u5927\u5B66\u4F1A\u5802:["daxuehuitang","dxht"],\u5927\u667A\u8DEF:["dazhilu","dzl"],\u5927\u6E7E\u533A\u521B\u65B0\u7814\u7A76\u9662:["dawanquchuangxinyanjiuyuan","dwqcxyjy"],\u5927\u7403\u573A:["daqiuchang","dqc"],\u5927\u78A7\u6C60:["dabichi","dbc"],\u5929\u4F51\u697C:["tianyoulou","tyl"],"\u5929\u5929\u6C34\u679C \u6C34\u679C\u635E":["tiantianshuiguo shuiguolao","ttsg sgl"],\u5931\u7269\u62DB\u9886:["shiwuzhaoling","swzl"],\u5931\u7269\u62DB\u9886\u5904:["shiwuzhaolingchu","swzlc"],\u597D\u9999\u8DA3\u5C0F\u5403:["haoxiangquxiaochi","hxqxc"],\u5982\u610F\u9910\u5385:["ruyicanting","ryct"],\u5983\u5B50\u7B11:["feizixiao","fzx"],\u5B66\u4E00\u98DF\u5802:["xueyishitang","xyst"],\u5B66\u4E09\u98DF\u5802:["xuesanshitang","xsst"],\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3:["xuexiziyuanzhongxin","xxzyzx"],\u5B66\u4E8C\u98DF\u5802:["xueershitang","xest"],\u5B66\u751F\u4E8B\u52A1\u5904:["xueshengshiwuchu","xsswc"],\u5B66\u751F\u5BBF\u820D10\u680B:["xueshengsushe10dong","xsss10d"],\u5B66\u751F\u5BBF\u820D11\u680B:["xueshengsushe11dong","xsss11d"],\u5B66\u751F\u5BBF\u820D12\u680B:["xueshengsushe12dong","xsss12d"],\u5B66\u751F\u5BBF\u820D13\u680B:["xueshengsushe13dong","xsss13d"],\u5B66\u751F\u5BBF\u820D14\u680B:["xueshengsushe14dong","xsss14d"],\u5B66\u751F\u5BBF\u820D15\u680B:["xueshengsushe15dong","xsss15d"],\u5B66\u751F\u5BBF\u820D16\u680B:["xueshengsushe16dong","xsss16d"],\u5B66\u751F\u5BBF\u820D17\u680B:["xueshengsushe17dong","xsss17d"],\u5B66\u751F\u5BBF\u820D18\u680B:["xueshengsushe18dong","xsss18d"],\u5B66\u751F\u5BBF\u820D19\u680B:["xueshengsushe19dong","xsss19d"],\u5B66\u751F\u5BBF\u820D1\u680B:["xueshengsushe1dong","xsss1d"],\u5B66\u751F\u5BBF\u820D20\u680B:["xueshengsushe20dong","xsss20d"],\u5B66\u751F\u5BBF\u820D21\u680B:["xueshengsushe21dong","xsss21d"],\u5B66\u751F\u5BBF\u820D24\u680B:["xueshengsushe24dong","xsss24d"],\u5B66\u751F\u5BBF\u820D25\u680B:["xueshengsushe25dong","xsss25d"],\u5B66\u751F\u5BBF\u820D26\u680B:["xueshengsushe26dong","xsss26d"],\u5B66\u751F\u5BBF\u820D27\u680B:["xueshengsushe27dong","xsss27d"],\u5B66\u751F\u5BBF\u820D28\u680B:["xueshengsushe28dong","xsss28d"],\u5B66\u751F\u5BBF\u820D29\u680B:["xueshengsushe29dong","xsss29d"],\u5B66\u751F\u5BBF\u820D2\u680B:["xueshengsushe2dong","xsss2d"],\u5B66\u751F\u5BBF\u820D30\u680B:["xueshengsushe30dong","xsss30d"],\u5B66\u751F\u5BBF\u820D31\u680B:["xueshengsushe31dong","xsss31d"],\u5B66\u751F\u5BBF\u820D32\u680B:["xueshengsushe32dong","xsss32d"],\u5B66\u751F\u5BBF\u820D33\u680B:["xueshengsushe33dong","xsss33d"],\u5B66\u751F\u5BBF\u820D34\u680B:["xueshengsushe34dong","xsss34d"],\u5B66\u751F\u5BBF\u820D35\u680B:["xueshengsushe35dong","xsss35d"],\u5B66\u751F\u5BBF\u820D36\u680B:["xueshengsushe36dong","xsss36d"],\u5B66\u751F\u5BBF\u820D37\u680B:["xueshengsushe37dong","xsss37d"],\u5B66\u751F\u5BBF\u820D38\u680B:["xueshengsushe38dong","xsss38d"],\u5B66\u751F\u5BBF\u820D39\u680B:["xueshengsushe39dong","xsss39d"],\u5B66\u751F\u5BBF\u820D3\u680B:["xueshengsushe3dong","xsss3d"],\u5B66\u751F\u5BBF\u820D40\u680B:["xueshengsushe40dong","xsss40d"],\u5B66\u751F\u5BBF\u820D41\u680B:["xueshengsushe41dong","xsss41d"],\u5B66\u751F\u5BBF\u820D4\u680B:["xueshengsushe4dong","xsss4d"],\u5B66\u751F\u5BBF\u820D5\u680B:["xueshengsushe5dong","xsss5d"],\u5B66\u751F\u5BBF\u820D6\u680B:["xueshengsushe6dong","xsss6d"],\u5B66\u751F\u5BBF\u820D7\u680B:["xueshengsushe7dong","xsss7d"],\u5B66\u751F\u5BBF\u820D8\u680B:["xueshengsushe8dong","xsss8d"],\u5B66\u751F\u5BBF\u820D9\u680B:["xueshengsushe9dong","xsss9d"],\u5B81\u5802:["ningtang","nt"],\u5B81\u5802\u6751:["ningtangcun","ntc"],\u5B81\u5802\u793E\u533A\u6587\u5316\u6D3B\u52A8\u4E2D\u5FC3:["ningtangshequwenhuahuodongzhongxin","ntsqwhhdzx"],\u5B81\u5802\u793E\u533A\u6D88\u9632\u5BA3\u4F20\u4E3B\u9898\u516C\u56ED:["ningtangshequxiaofangxuanchuanzhutigongyuan","ntsqxfxcztgy"],\u5B8F\u5229\u836F\u4E1A:["hongliyaoye","hlyy"],\u5B98\u5858:["guantang","gt"],\u5B98\u5858\u4E09\u6751:["guantangsancun","gtsc"],\u5B98\u5858\u5357:["guantangnan","gtn"],\u5B98\u6751:["guancun","gc"],\u5B9D\u83B1\u7279\u79D1\u6280:["baolaitekeji","bltkj"],\u5C0F\u6768\u54E5\u732A\u811A\u996D:["xiaoyanggezhujiaofan","xygzjf"],\u5C0F\u7403\u573A:["xiaoqiuchang","xqc"],\u5C0F\u7BEE\u7403\u573A:["xiaolanqiuchang","xlqc"],\u5C0F\u8857\u80E1\u540C\u725B\u6742\u9762:["xiaojiehutongniuzamian","xjhtnzm"],"\u5C0F\u9547\u73AF\u8DEF\uFF08\u89C4\u5212\uFF09":["xiaozhenhuanlu\uFF08guihua\uFF09","xzhl\uFF08gh\uFF09"],\u5C1D\u7EFF:["changl\xFC","cl"],"\u5C71\u91CE\u95F4\xB7\u4F1A\u540C\u8425\u5730":["shanyejian\xB7huitongyingdi","syj\xB7htyd"],"\u5C7F\u53EF Yekoo":["yuke Yekoo","yk Yekoo"],\u5C7F\u53F8:["yusi","ys"],\u5DE5\u4E1A\u81EA\u52A8\u5316\u5B66\u9662:["gongyezidonghuaxueyuan","gyzdhxy"],\u5E03\u83B1\u6069\u7279\u9879\u76EE:["bulaientexiangmu","bletxm"],\u5E08\u751F\u6D3B\u52A8\u4E2D\u5FC3:["shishenghuodongzhongxin","sshdzx"],"\u5E38\u6765\xB7\u6E2F\u8BB0\u51B0\u5BA4":["changlai\xB7gangjibingshi","cl\xB7gjbs"],\u5E78\u8FD0\u9762\u5305:["xingyunmianbao","xymb"],\u5E7F\u5F0F\u62C9\u80A0:["guangshilachang","gslc"],\u5E7F\u5F0F\u70E7\u814A:["guangshishaola","gssl"],\u5E7F\u6FB3\u9AD8\u901F:["guangaogaosu","gags"],\u5E93\u8FEA\u5496\u5561:["kudikafei","kdkf"],\u5EB7\u987A\u7EFF\u9053:["kangshunl\xFCdao","ksld"],\u5F04\u6F6E:["nongchao","nc"],\u5F18\u6587\u697C:["hongwenlou","hwl"],\u5F18\u6BC5\u697C:["hongyilou","hyl"],\u5F97\u4E00\u4FBF\u5229:["deyibianli","dybl"],\u5F97\u4E00\u7172\u4ED4\u996D:["deyibaozaifan","dybzf"],\u5F97\u4F73\u7535\u5668:["dejiadianqi","djdq"],\u5FB7\u8C6A\u6DA6\u8FBE:["dehaorunda","dhrd"],\u5FC3\u6F6E:["xinchao","xc"],\u5FC5\u80DC\u5BA2:["bishengke","bsk"],\u5FD7\u5C11\u4FA0\u94C1\u677F\u996D:["zhishaoxiatiebanfan","zsxtbf"],\u6021\u8D2D\u8D85\u5E02:["yigouchaoshi","ygcs"],"\u60A0\u7136Crazy\u8FDE\u9501\u516C\u5BD3\uFF08\u5510\u5BB6\u6E7E\u8F7B\u8F68\u7AD9\u5E97\uFF09":["youranCrazyliansuogongyu\uFF08tangjiawanqingguizhandian\uFF09","yrCrazylsgy\uFF08tjwqgzd\uFF09"],"\u60A6\u8F7B\u8377 \u8F7B\u98DF":["yueqinghe qingshi","yqh qs"],\u6234\u7EF4\u65AF:["daiweisi","dws"],\u623F\u8BB0\u4E91\u5988\u7F50\u7F50\u7C73\u7EBF:["fangjiyunmaguanguanmixian","fjymggmx"],\u62AB\u8428\u4E4B\u795E:["pisazhishen","pszs"],"\u62CC\u58F9\u6876 \u5E72\u62CC\u5192\u83DC":["banyitong ganbanmaocai","byt gbmc"],\u62D3\u5C55\u8BAD\u7EC3\u573A:["tuozhanxunlianchang","tzxlc"],"\u62DB\u5546\u94F6\u884C ATM":["zhaoshangyinhang ATM","zsyh ATM"],\u62F1\u661F\u4E09\u5DF7\u53E3:["gongxingsanxiangkou","gxsxk"],\u62FE\u5149\u4E66\u5C4B:["shiguangshuwu","sgsw"],\u62FE\u5149\u6587\u521B\u9986:["shiguangwenchuangguan","sgwcg"],"\u62FE\u5706\xB7\u6392\u9AA8\u6382":["shiyuan\xB7paigudian","sy\xB7pgd"],\u6559\u52A1\u5904:["jiaowuchu","jwc"],\u6559\u5E08\u516C\u5BD3T1:["jiaoshigongyuT1","jsgyT1"],\u6559\u5E08\u516C\u5BD3T2:["jiaoshigongyuT2","jsgyT2"],\u6559\u5E08\u516C\u5BD3T3:["jiaoshigongyuT3","jsgyT3"],\u6559\u5E08\u516C\u5BD3T4:["jiaoshigongyuT4","jsgyT4"],\u6559\u5E08\u516C\u5BD3T5:["jiaoshigongyuT5","jsgyT5"],\u6559\u5E08\u516C\u5BD3T6:["jiaoshigongyuT6","jsgyT6"],\u6559\u5E08\u516C\u5BD3T7:["jiaoshigongyuT7","jsgyT7"],\u6559\u5E08\u516C\u5BD3T8:["jiaoshigongyuT8","jsgyT8"],\u6559\u5E08\u516C\u5BD3T9:["jiaoshigongyuT9","jsgyT9"],\u6559\u5E08\u516C\u5BD3\u4E8C\u671F:["jiaoshigongyuerqi","jsgyeq"],\u6570\u7406\u4E0E\u571F\u6728\u5DE5\u7A0B\u5B66\u9662:["shuliyutumugongchengxueyuan","slytmgcxy"],\u6587\u4F53\u4E2D\u5FC3:["wentizhongxin","wtzx"],\u6587\u5316\u521B\u610F\u7FA4\u843D:["wenhuachuangyiqunluo","whcyql"],\u6587\u534E\u82D1:["wenhuayuan","why"],\u6587\u534E\u82D11\u680B:["wenhuayuan1dong","why1d"],\u6587\u534E\u82D12\u680B:["wenhuayuan2dong","why2d"],\u6587\u534E\u82D13\u680B:["wenhuayuan3dong","why3d"],\u6587\u534E\u82D14\u680B:["wenhuayuan4dong","why4d"],\u6587\u534E\u82D15\u680B:["wenhuayuan5dong","why5d"],\u6587\u534E\u82D16\u680B:["wenhuayuan6dong","why6d"],\u6587\u534E\u82D18\u680B:["wenhuayuan8dong","why8d"],"\u6587\u534E\u82D1\u56FE\u4E66\u9986/\u6587\u534E\u82D17\u680B":["wenhuayuantushuguan/wenhuayuan7dong","whytsg/why7d"],\u6587\u534E\u82D1\u9910\u5385:["wenhuayuancanting","whyct"],"\u65B0\u4E1C\u767E\u8D27\uFF08\u5B81\u5802\u5206\u5E97\uFF09":["xindongbaihuo\uFF08ningtangfendian\uFF09","xdbh\uFF08ntfd\uFF09"],\u65B0\u56F4:["xinwei","xw"],\u65B0\u56F4\u6751:["xinweicun","xwc"],\u65B0\u56F4\u6751\u53E3:["xinweicunkou","xwck"],\u65B0\u5D34\u516C\u9986:["xinwaigongguan","xwgg"],\u65B0\u6751:["xincun","xc"],\u65B0\u6751\u53E3:["xincunkou","xck"],\u65B0\u96C5\u8DEF:["xinyalu","xyl"],\u65F6\u5149\u852C\u679C:["shiguangshuguo","sgsg"],\u660E\u5FB7\u697C:["mingdelou","mdl"],\u660E\u5FB7\u6E56:["mingdehu","mdh"],\u660E\u6D1E\u62CC\u996D:["mingdongbanfan","mdbf"],\u661F\u4ED4\u5C71\u516C\u56ED:["xingzaishangongyuan","xzsgy"],\u661F\u5DF4\u514B:["xingbake","xbk"],\u661F\u661F\u4FBF\u5229\u5E97:["xingxingbianlidian","xxbld"],\u661F\u671F\u516B:["xingqiba","xqb"],\u661F\u706B\u95E8:["xinghuomen","xhm"],\u6625\u6656\u56ED:["chunhuiyuan","chy"],\u666E\u751F\u533B\u7597\u79D1\u6280:["pushengyiliaokeji","psylkj"],\u666F\u5CF0\u5E7F\u573A:["jingfengguangchang","jfgc"],\u667A\u660E\u8DEF:["zhiminglu","zml"],\u667A\u8BDA\u8DEF:["zhichenglu","zcl"],\u66E6\u56ED:["xiyuan","xy"],\u6708\u4EAE\u6E56:["yuelianghu","ylh"],\u6728\u94CE\u697C:["muduolou","mdl"],"\u672A\u547D\u540D\u5EFA\u7B51 1191618603":["weimingmingjianzhu 1191618603","wmmjz 1191618603"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625876":["weimingmingjianzhu 1201625876","wmmjz 1201625876"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625882":["weimingmingjianzhu 1201625882","wmmjz 1201625882"],"\u672A\u547D\u540D\u5EFA\u7B51 1201625883":["weimingmingjianzhu 1201625883","wmmjz 1201625883"],"\u672A\u547D\u540D\u5EFA\u7B51 1202303549":["weimingmingjianzhu 1202303549","wmmjz 1202303549"],"\u672A\u547D\u540D\u5EFA\u7B51 1206553328":["weimingmingjianzhu 1206553328","wmmjz 1206553328"],"\u672A\u547D\u540D\u5EFA\u7B51 1206553329":["weimingmingjianzhu 1206553329","wmmjz 1206553329"],"\u672A\u547D\u540D\u5EFA\u7B51 1209647875":["weimingmingjianzhu 1209647875","wmmjz 1209647875"],"\u672A\u547D\u540D\u5EFA\u7B51 1215697328":["weimingmingjianzhu 1215697328","wmmjz 1215697328"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048510":["weimingmingjianzhu 1384048510","wmmjz 1384048510"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048511":["weimingmingjianzhu 1384048511","wmmjz 1384048511"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048512":["weimingmingjianzhu 1384048512","wmmjz 1384048512"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048513":["weimingmingjianzhu 1384048513","wmmjz 1384048513"],"\u672A\u547D\u540D\u5EFA\u7B51 1384048514":["weimingmingjianzhu 1384048514","wmmjz 1384048514"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101157":["weimingmingjianzhu 1384101157","wmmjz 1384101157"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101158":["weimingmingjianzhu 1384101158","wmmjz 1384101158"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101159":["weimingmingjianzhu 1384101159","wmmjz 1384101159"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101160":["weimingmingjianzhu 1384101160","wmmjz 1384101160"],"\u672A\u547D\u540D\u5EFA\u7B51 1384101161":["weimingmingjianzhu 1384101161","wmmjz 1384101161"],"\u672A\u547D\u540D\u5EFA\u7B51 1388933765":["weimingmingjianzhu 1388933765","wmmjz 1388933765"],"\u672A\u547D\u540D\u5EFA\u7B51 1434554451":["weimingmingjianzhu 1434554451","wmmjz 1434554451"],"\u672A\u547D\u540D\u5EFA\u7B51 1434554454":["weimingmingjianzhu 1434554454","wmmjz 1434554454"],"\u672A\u547D\u540D\u5EFA\u7B51 1446422779":["weimingmingjianzhu 1446422779","wmmjz 1446422779"],"\u672A\u547D\u540D\u5EFA\u7B51 1446422780":["weimingmingjianzhu 1446422780","wmmjz 1446422780"],"\u672A\u547D\u540D\u5EFA\u7B51 1459082762":["weimingmingjianzhu 1459082762","wmmjz 1459082762"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105120":["weimingmingjianzhu 1459105120","wmmjz 1459105120"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105121":["weimingmingjianzhu 1459105121","wmmjz 1459105121"],"\u672A\u547D\u540D\u5EFA\u7B51 1459105140":["weimingmingjianzhu 1459105140","wmmjz 1459105140"],"\u672A\u547D\u540D\u5EFA\u7B51 18706867":["weimingmingjianzhu 18706867","wmmjz 18706867"],"\u672A\u547D\u540D\u5EFA\u7B51 19666480":["weimingmingjianzhu 19666480","wmmjz 19666480"],"\u672A\u547D\u540D\u5EFA\u7B51 19971851":["weimingmingjianzhu 19971851","wmmjz 19971851"],"\u672A\u547D\u540D\u5EFA\u7B51 19971852":["weimingmingjianzhu 19971852","wmmjz 19971852"],"\u672A\u547D\u540D\u5EFA\u7B51 664093255":["weimingmingjianzhu 664093255","wmmjz 664093255"],"\u672A\u547D\u540D\u5EFA\u7B51 664093282":["weimingmingjianzhu 664093282","wmmjz 664093282"],"\u672A\u547D\u540D\u5EFA\u7B51 664093284":["weimingmingjianzhu 664093284","wmmjz 664093284"],\u674E\u601D\u751C\u6C34\u679C\u635E:["lisitianshuiguolao","lstsgl"],\u6750\u6599\u4E0E\u73AF\u5883\u5B66\u9662:["cailiaoyuhuanjingxueyuan","clyhjxy"],\u6765\u5BA2\u8D85\u5E02:["laikechaoshi","lkcs"],\u679C\u9017\u8336:["guodoucha","gdc"],\u67CF\u53F6\u6797:["baiyelin","byl"],\u67CF\u53F6\u6797\u4E1C:["baiyelindong","byld"],\u67CF\u53F6\u6797\u6751\u8001\u4EBA\u4E2D\u5FC3:["baiyelincunlaorenzhongxin","bylclrzx"],\u67CF\u6797\u8DEF:["bolinlu","bll"],\u67F3\u5DDE\u87BA\u86F3\u7C89:["liuzhouluosifen","lzlsf"],\u6811\u6797:["shulin","sl"],\u6816\u971E\u4ED9\u9986:["qixiaxianguan","qxxg"],\u6821\u53F2\u9986:["xiaoshiguan","xsg"],\u6821\u540D\u77F3:["xiaomingshi","xms"],\u6821\u56ED\u56FE\u6587:["xiaoyuantuwen","xytw"],\u6821\u56ED\u5C0F\u6E7F\u5730:["xiaoyuanxiaoshidi","xyxsd"],\u683C\u529B\u5B66\u9662:["gelixueyuan","glxy"],\u6842\u6E90\u7965:["guiyuanxiang","gyx"],\u6986\u6808:["yuzhan","yz"],\u6A2A\u5E97\u5F71\u57CE:["hengdianyingcheng","hdyc"],\u6A80\u9999\u5C71\u5496\u5561:["tanxiangshankafei","txskf"],\u6B63\u5751:["zhengkeng","zk"],\u6B63\u5751\u6C34\u5E93\u8DEF\u53E3:["zhengkengshuikulukou","zksklk"],\u6C11\u5546\u6CD5\u5F8B\u5B66\u9662:["minshangfal\xFCxueyuan","msflxy"],"\u6C34\u6676\u4E4B\u604B\uFF08\u5B81\u5802\u9547\u5E97\uFF09":["shuijingzhilian\uFF08ningtangzhendian\uFF09","sjzl\uFF08ntzd\uFF09"],\u6C38\u4E30\u8DEF\u53E3:["yongfenglukou","yflk"],\u6C42\u662F\u697C:["qiushilou","qsl"],"\u6C47\u7EB3\u4E2D\u8DEF\uFF08\u89C4\u5212\uFF09":["huinazhonglu\uFF08guihua\uFF09","hnzl\uFF08gh\uFF09"],\u6C55\u5934\u7CBF\u6761\u6C64:["shantouguotiaotang","stgtt"],\u6C64\u59C6\u7EA6\u514B:["tangmuyueke","tmyk"],\u6C64\u7C89\u4E16\u5BB6:["tangfenshijia","tfsj"],\u6D17\u624B\u95F4:["xishoujian","xsj"],\u6D6E\u5C7F:["fuyu","fy"],\u6D77\u534E\u82D110\u680B:["haihuayuan10dong","hhy10d"],\u6D77\u534E\u82D111\u680B:["haihuayuan11dong","hhy11d"],\u6D77\u534E\u82D112\u680B:["haihuayuan12dong","hhy12d"],\u6D77\u534E\u82D113\u680B:["haihuayuan13dong","hhy13d"],\u6D77\u534E\u82D114\u680B:["haihuayuan14dong","hhy14d"],\u6D77\u534E\u82D115\u680B:["haihuayuan15dong","hhy15d"],\u6D77\u534E\u82D11\u680B:["haihuayuan1dong","hhy1d"],\u6D77\u534E\u82D12\u680B:["haihuayuan2dong","hhy2d"],\u6D77\u534E\u82D13\u680B:["haihuayuan3dong","hhy3d"],\u6D77\u534E\u82D16\u680B:["haihuayuan6dong","hhy6d"],\u6D77\u534E\u82D17\u680B:["haihuayuan7dong","hhy7d"],\u6D77\u534E\u82D18\u680B:["haihuayuan8dong","hhy8d"],\u6D77\u534E\u82D19\u680B:["haihuayuan9dong","hhy9d"],\u6D77\u5357\u9E21\u996D:["hainanjifan","hnjf"],\u6D78\u4F1A\u5927\u5B66\u4E1C:["jinhuidaxuedong","jhdxd"],\u6D78\u4F1A\u5927\u5B66\u8DEF:["jinhuidaxuelu","jhdxl"],\u6D88\u9632\u6813:["xiaofangshuan","xfs"],\u6D88\u9632\u6C34\u6C60:["xiaofangshuichi","xfsc"],\u6D88\u9632\u7AD9:["xiaofangzhan","xfz"],"\u6E1D\u638C\u67DC \u677F\u51F3\u9762":["yuzhanggui bandengmian","yzg bdm"],\u6E2F\u4FE1\u9A7E\u6821:["gangxinjiaxiao","gxjx"],\u6E2F\u5F0F\u5C0F\u53A8:["gangshixiaochu","gsxc"],\u6E2F\u5F0F\u70E7\u814A:["gangshishaola","gssl"],"\u6E2F\u5F0F\u8336\u9910\u5385\u2022\u6252\u996D":["gangshichacanting\u2022bafan","gscct\u2022bf"],\u6E38\u4E50\u573A:["youlechang","ylc"],\u6E38\u6CF3\u6C60:["youyongchi","yyc"],\u6E38\u6CF3\u9986:["youyongguan","yyg"],\u6E56\u7554\u9910\u5385:["hupancanting","hpct"],\u6E58\u805A\u7F18:["xiangjuyuan","xjy"],\u6EA2\u9999\u6E90:["yixiangyuan","yxy"],"\u6EA2\u9999\u6E90 A\u5E97":["yixiangyuan Adian","yxy Ad"],"\u6EA2\u9999\u6E90 B\u5E97":["yixiangyuan Bdian","yxy Bd"],\u6EF4\u6EF4\u8F66\u7AD9:["didichezhan","ddcz"],\u6F14\u827A\u5385:["yanyiting","yyt"],"\u6F6E\u5BA2\u6808\uFF08\u5510\u5BB6\u6E7E\u7AD9\u5B81\u5802\u5E97\uFF09":["chaokezhan\uFF08tangjiawanzhanningtangdian\uFF09","ckz\uFF08tjwzntd\uFF09"],"\u70E9\u574A \u6CE5\u7168\u9E21":["huifang niweiji","hf nwj"],\u71D5\u534E\u6C60:["yanhuachi","yhc"],\u71D5\u534E\u82D1:["yanhuayuan","yhy"],\u71D5\u534E\u82D11\u680B:["yanhuayuan1dong","yhy1d"],\u71D5\u534E\u82D12\u680B:["yanhuayuan2dong","yhy2d"],\u71D5\u534E\u82D13\u680B:["yanhuayuan3dong","yhy3d"],\u71D5\u534E\u82D14\u680B:["yanhuayuan4dong","yhy4d"],\u71D5\u534E\u82D15\u680B:["yanhuayuan5dong","yhy5d"],\u71D5\u534E\u82D16\u680B:["yanhuayuan6dong","yhy6d"],\u71D5\u534E\u82D17\u680B:["yanhuayuan7dong","yhy7d"],\u71D5\u534E\u82D18\u680B:["yanhuayuan8dong","yhy8d"],"\u725B\u5764\u8BB0 \u6C99\u53BF\u5C0F\u5403":["niukunji shaxianxiaochi","nkj sxxc"],"\u725B\u8089\u9762\xB7\u4E1C\u5317\u997A\u5B50\xB7\u87BA\u86F3\u7C89":["niuroumian\xB7dongbeijiaozi\xB7luosifen","nrm\xB7dbjz\xB7lsf"],\u725B\u8089\u996D:["niuroufan","nrf"],\u7269\u4E1A\u7BA1\u7406\u5904:["wuyeguanlichu","wyglc"],"\u738B\u559C\u5CF0 Spicy Hot Pot":["wangxifeng Spicy Hot Pot","wxf Spicy Hot Pot"],\u73E0\u5F71\u8D85\u5E02:["zhuyingchaoshi","zycs"],\u73E0\u6D77\u4E00\u5BBF\u6C11\u5BBF:["zhuhaiyisuminsu","zhysms"],\u73E0\u6D77\u4E2B\u4E00\u516C\u5BD3:["zhuhaiyayigongyu","zhyygy"],\u73E0\u6D77\u4F0A\u4EBA\u5BA2\u6808:["zhuhaiyirenkezhan","zhyrkz"],\u73E0\u6D77\u53CB\u60C5\u516C\u5BD3:["zhuhaiyouqinggongyu","zhyqgy"],\u73E0\u6D77\u540D\u5C45\u516C\u5BD3:["zhuhaimingjugongyu","zhmjgy"],\u73E0\u6D77\u5B9D\u8D1D\u6C11\u5BBF:["zhuhaibaobeiminsu","zhbbms"],\u73E0\u6D77\u5DE6\u5CB8\u4E3B\u9898\u516C\u5BD3:["zhuhaizuoanzhutigongyu","zhzaztgy"],\u73E0\u6D77\u5E02\u6B27\u4E9A\u6280\u5DE5\u5B66\u6821:["zhuhaishiouyajigongxuexiao","zhsoyjgxx"],\u73E0\u6D77\u5E02\u80B2\u5FB7\u5B66\u6821:["zhuhaishiyudexuexiao","zhsydxx"],\u73E0\u6D77\u5E02\u91D1\u9F0E\u4E2D\u5B66:["zhuhaishijindingzhongxue","zhsjdzx"],\u73E0\u6D77\u6708\u4EAE\u6E7E\u516C\u5BD3:["zhuhaiyueliangwangongyu","zhylwgy"],\u73E0\u6D77\u683C\u529B\u804C\u4E1A\u5B66\u9662:["zhuhaigelizhiyexueyuan","zhglzyxy"],\u73E0\u6D77\u6C81\u56ED\u9152\u5E97\u516C\u5BD3:["zhuhaiqinyuanjiudiangongyu","zhqyjdgy"],\u73E0\u6D77\u82B1\u60A6\u5BA2\u6808:["zhuhaihuayuekezhan","zhhykz"],\u73E0\u6D77\u82B1\u6837\u5E74\u534E\u516C\u5BD3:["zhuhaihuayangnianhuagongyu","zhhynhgy"],\u73E0\u6D77\u82F1\u640F\u5C14\u65B0\u80FD\u6E90\u6C7D\u8F66\u52A8\u529B\u603B\u6210\u5DE5\u5382:["zhuhaiyingboerxinnengyuanqichedonglizongchenggongchang","zhybexnyqcdlzcgc"],\u73E0\u6D77\u84DD\u6E7E\u516C\u5BD3:["zhuhailanwangongyu","zhlwgy"],\u73E0\u6D77\u8F6C\u89D2\u516C\u5BD3:["zhuhaizhuanjiaogongyu","zhzjgy"],\u73E0\u6D77\u9999\u683C\u91CC\u62C9\u516C\u5BD3:["zhuhaixianggelilagongyu","zhxgllgy"],\u73E0\u6D77\u9AD8\u65B0\u533A\u4EBA\u6C11\u533B\u9662:["zhuhaigaoxinqurenminyiyuan","zhgxqrmyy"],\u73E0\u6D77\u9AD8\u65B0\u533A\u53E4\u5143\u5C0F\u5B66:["zhuhaigaoxinquguyuanxiaoxue","zhgxqgyxx"],\u73E0\u6D77\u9AD8\u65B0\u533A\u6C38\u4E30\u5C0F\u5B66:["zhuhaigaoxinquyongfengxiaoxue","zhgxqyfxx"],\u73E0\u6D77\u9AD8\u65B0\u5B9D\u9F99\u5E7F\u573A:["zhuhaigaoxinbaolongguangchang","zhgxblgc"],\u73E0\u6E20\u5317\u8DEF:["zhuqubeilu","zqbl"],\u7422\u4E50\u6C47:["zhuolehui","zlh"],\u745E\u5E78\u5496\u5561:["ruixingkafei","rxkf"],\u76CA\u79BE\u5802:["yihetang","yht"],\u77E5\u884C\u697C:["zhixinglou","zxl"],\u798F\u5EFA\u5C0F\u5403:["fujianxiaochi","fjxc"],\u79CB\u94ED\u6C11\u5BBF:["qiumingminsu","qmms"],\u79D1\u76EE\u4E8C\u8003\u8BD5\u573A\u5730:["kemuerkaoshichangdi","kmekscd"],\u79D1\u96C5\u82D1:["keyayuan","kyy"],"\u7A46\u5473\u738B\n\u79C1\u623F\u725B\u8089\u9762":[`muweiwang
sifangniuroumian`,`mww
sfnrm`],\u7ACB\u8EAB\u8F69:["lishenxuan","lsx"],"\u7B80 Hair Saloon":["jian Hair Saloon","j Hair Saloon"],\u7B80\u4E5F\u8336\u96C6:["jianyechaji","jycj"],\u7B80\u7F8E\u6C11\u5BBF:["jianmeiminsu","jmms"],\u7BEE\u7403\u573A:["lanqiuchang","lqc"],\u7CA4\u534E\u82D110\u680B:["yuehuayuan10dong","yhy10d"],\u7CA4\u534E\u82D111\u680B:["yuehuayuan11dong","yhy11d"],\u7CA4\u534E\u82D114\u680B:["yuehuayuan14dong","yhy14d"],\u7CA4\u534E\u82D115\u680B:["yuehuayuan15dong","yhy15d"],\u7CA4\u534E\u82D116\u680B:["yuehuayuan16dong","yhy16d"],\u7CA4\u534E\u82D117\u680B:["yuehuayuan17dong","yhy17d"],\u7CA4\u534E\u82D118\u680B:["yuehuayuan18dong","yhy18d"],\u7CA4\u534E\u82D119\u680B:["yuehuayuan19dong","yhy19d"],\u7CA4\u534E\u82D11\u680B:["yuehuayuan1dong","yhy1d"],\u7CA4\u534E\u82D120\u680B:["yuehuayuan20dong","yhy20d"],\u7CA4\u534E\u82D121\u680B:["yuehuayuan21dong","yhy21d"],\u7CA4\u534E\u82D122\u680B:["yuehuayuan22dong","yhy22d"],\u7CA4\u534E\u82D12\u680B:["yuehuayuan2dong","yhy2d"],\u7CA4\u534E\u82D13\u680B:["yuehuayuan3dong","yhy3d"],\u7CA4\u534E\u82D14\u680B:["yuehuayuan4dong","yhy4d"],\u7CA4\u534E\u82D15\u680B:["yuehuayuan5dong","yhy5d"],\u7CA4\u534E\u82D16\u680B:["yuehuayuan6dong","yhy6d"],\u7CA4\u534E\u82D17\u680B:["yuehuayuan7dong","yhy7d"],\u7CA4\u534E\u82D18\u680B:["yuehuayuan8dong","yhy8d"],\u7CA4\u534E\u82D19\u680B:["yuehuayuan9dong","yhy9d"],\u7CA4\u534E\u82D1\u8336\u9910\u5385:["yuehuayuanchacanting","yhycct"],\u7CBE\u5DE5\u697C:["jinggonglou","jgl"],\u7CBE\u5DE5\u8DEF:["jinggonglu","jgl"],\u7D20\u62D3\u57FA\u5730:["sutuojidi","stjd"],\u7EB3\u6C34\u5317\u73AF\u8DEF:["nashuibeihuanlu","nsbhl"],\u7EF4\u4E5F\u7EB3\u56FD\u9645\u9152\u5E97:["weiyenaguojijiudian","wyngjjd"],\u7EFF\u690D:["l\xFCzhi","lz"],\u7F25\u96EA:["piaoxue","px"],\u7F51\u7403\u573A:["wangqiuchang","wqc"],\u7F57\u5E78\u6751:["luoxingcun","lxc"],\u7F8E\u5B9C\u4F73:["meiyijia","myj"],\u7FE0\u6E56\u58EB\u591A\u4FBF\u5229\u5E97:["cuihushiduobianlidian","chsdbld"],\u8001\u5C4B\u5496\u5561:["laowukafei","lwkf"],"\u8001\u7897\u4F1A\xB7\u9655\u897F\u624B\u5DE5\u9762\uFF08\u73E0\u6D77\u5B9D\u9F99\u5E97\uFF09":["laowanhui\xB7shanxishougongmian\uFF08zhuhaibaolongdian\uFF09","lwh\xB7sxsgm\uFF08zhbld\uFF09"],\u80AF\u5FB7\u57FA:["kendeji","kdj"],\u81EA\u884C\u8F66\u505C\u8F66\u5904:["zixingchetingchechu","zxctcc"],\u81EA\u9009\u997A\u5B50:["zixuanjiaozi","zxjz"],\u81FB\u82D1\u79C1\u53A8:["zhenyuansichu","zysc"],\u827A\u5CEF:["yifeng","yf"],\u827A\u60A6\u697C:["yiyuelou","yyl"],\u827A\u672F\u6797:["yishulin","ysl"],\u82B1\u56ED:["huayuan","hy"],\u82B1\u5C7F:["huayu","hy"],"\u82B1\u7532\u7C89 \u7802\u9505\u7C73\u7EBF":["huajiafen shaguomixian","hjf sgmx"],\u82B1\u95F4\u5C0F\u70B9:["huajianxiaodian","hjxd"],\u82F1\u8BED\u8BED\u8A00\u4E2D\u5FC3:["yingyuyuyanzhongxin","yyyyzx"],\u8336\u767E\u9053:["chabaidao","cbd"],\u8349\u5730\u516C\u56ED:["caodigongyuan","cdgy"],\u8354\u56ED\u767E\u8D27\u8D85\u5E02:["liyuanbaihuochaoshi","lybhcs"],\u8354\u679D\u516C\u56ED:["lizhigongyuan","lzgy"],\u8354\u679D\u56ED:["lizhiyuan","lzy"],\u8354\u679D\u5C9B:["lizhidao","lzd"],\u8354\u679D\u5C9B\u516C\u56ED:["lizhidaogongyuan","lzdgy"],\u8363\u4E00\u8FDE\u9501\u8D85\u5E02:["rongyiliansuochaoshi","rylscs"],\u8377\u9999\u6E56:["hexianghu","hxh"],\u83AB\u6C0F\u5927\u5B97\u7960:["moshidazongci","msdzc"],\u83DC\u9E1F\u9A7F\u7AD9:["cainiaoyizhan","cnyz"],\u8700\u9999\u56ED:["shuxiangyuan","sxy"],\u8702\u5DE2\u5FEB\u9012\u67DC:["fengchaokuaidigui","fckdg"],\u8708\u86A3\u5CAD:["wugongling","wgl"],\u871C\u96EA\u51B0\u57CE:["mixuebingcheng","mxbc"],\u873B\u8713\u6E7E:["qingtingwan","qtw"],\u884C\u653F\u697C:["xingzhenglou","xzl"],\u897F\u533A\u505C\u8F66\u573A:["xiqutingchechang","xqtcc"],\u897F\u8DB3\u7403\u573A:["xizuqiuchang","xzqc"],\u897F\u95E8:["ximen","xm"],\u8BA1\u7B97\u673A\u4E2D\u5FC3:["jisuanjizhongxin","jsjzx"],\u8BA1\u7B97\u673A\u5B66\u9662:["jisuanjixueyuan","jsjxy"],"\u8BB0\u5FC6\u5C0F\u7B3C\u5305 \u539F\u5473\u6C64\u7C89\u738B":["jiyixiaolongbao yuanweitangfenwang","jyxlb ywtfw"],\u8BBE\u8BA1\u4E0E\u827A\u672F\u5B66\u9662:["shejiyuyishuxueyuan","sjyysxy"],\u8BFB\u4E66\u5C9B:["dushudao","dsd"],\u8C03\u6885\u7960:["tiaomeici","tmc"],\u8D24\u8D24\u5C45\u9910\u5385:["xianxianjucanting","xxjct"],\u8D5B\u767E\u5473:["saibaiwei","sbw"],\u8D64\u82B1\u5C71:["chihuashan","chs"],\u8D64\u82B1\u5C71\u8DEF:["chihuashanlu","chsl"],\u8D75\u8BB0\u4F20\u627F:["zhaojichuancheng","zjcc"],\u8FD0\u52A8\u573A:["yundongchang","ydc"],\u9047\u89C1:["yujian","yj"],\u9047\u89C1\u5C0F\u9762:["yujianxiaomian","yjxm"],\u9053\u95F8:["daozha","dz"],\u906E\u96E8\u68DA:["zheyupeng","zyp"],\u90A3\u4E1C\u4E09\u8DEF:["nadongsanlu","ndsl"],\u90A3\u6D32:["nazhou","nz"],\u90A3\u6D32\u5C0F\u5B66:["nazhouxiaoxue","nzxx"],\u90A3\u6D32\u724C\u574A:["nazhoupaifang","nzpf"],\u90A3\u6D32\u7EFF\u9053:["nazhoul\xFCdao","nzld"],\u90A3\u6D32\u827A\u672F\u521B\u65B0\u56ED\u533A:["nazhouyishuchuangxinyuanqu","nzyscxyq"],\u90A3\u6D32\u9AD8\u901F\u8DEF\u53E3:["nazhougaosulukou","nzgslk"],\u90A3\u6EAA\u624B\u4F5C\u8336\u679C:["naxishouzuochaguo","nxszcg"],\u91CD\u5E86\u5C0F\u9762:["chongqingxiaomian","cqxm"],\u91CD\u5E86\u9E21\u516C\u7172:["chongqingjigongbao","cqjgb"],\u91D1\u4E1A\u4E00\u8DEF:["jinyeyilu","jyyl"],\u91D1\u4E30\u4E8C\u8DEF:["jinfengerlu","jfel"],\u91D1\u51E4\u5C0F\u5B66:["jinfengxiaoxue","jfxx"],\u91D1\u540C\u8DEF:["jintonglu","jtl"],\u91D1\u54C1\u4E00\u8DEF:["jinpinyilu","jpyl"],\u91D1\u54C1\u4E8C\u8DEF:["jinpinerlu","jpel"],\u91D1\u56ED\u516D\u8DEF:["jinyuanliulu","jyll"],\u91D1\u56ED\u8DEF\u53E3:["jinyuanlukou","jylk"],\u91D1\u56FE\u8DEF:["jintulu","jtl"],\u91D1\u5706\u4E8C\u8DEF\u53E3:["jinyuanerlukou","jyelk"],\u91D1\u58F0\u697C:["jinshenglou","jsl"],\u91D1\u5CF0\u5317\u8DEF\u5357:["jinfengbeilunan","jfbln"],\u91D1\u5CF0\u793E\u533A:["jinfengshequ","jfsq"],\u91D1\u5CF0\u897F\u8DEF:["jinfengxilu","jfxl"],\u91D1\u6052\u4E00\u8DEF:["jinhengyilu","jhyl"],\u91D1\u6052\u4E00\u8DEF\u4E2D:["jinhengyiluzhong","jhylz"],\u91D1\u6052\u4E8C\u8DEF:["jinhengerlu","jhel"],\u91D1\u6842\u8DEF:["jinguilu","jgl"],\u91D1\u6B67\u8DEF:["jinqilu","jql"],\u91D1\u6C38\u4E00\u8DEF:["jinyongyilu","jyyl"],\u91D1\u6C38\u4E8C\u8DEF:["jinyongerlu","jyel"],\u91D1\u6D32\u4E94\u8DEF:["jinzhouwulu","jzwl"],\u91D1\u6D32\u56DB\u8DEF:["jinzhousilu","jzsl"],\u91D1\u6D32\u8DEF:["jinzhoulu","jzl"],\u91D1\u6EAA\u5927\u9053:["jinxidadao","jxdd"],\u91D1\u7115\u8DEF:["jinhuanlu","jhl"],\u91D1\u73AF\u8DEF:["jinhuanlu","jhl"],\u91D1\u745E\u4E00\u8DEF:["jinruiyilu","jryl"],\u91D1\u745E\u4E8C\u8DEF\u897F:["jinruierluxi","jrelx"],\u91D1\u878D\u5546\u52A1\u4E2D\u5FC3:["jinrongshangwuzhongxin","jrswzx"],\u91D1\u9E3F\u4E03\u8DEF:["jinhongqilu","jhql"],\u91D1\u9E3F\u4E09\u8DEF:["jinhongsanlu","jhsl"],\u91D1\u9E3F\u4E94\u8DEF:["jinhongwulu","jhwl"],\u91D1\u9E3F\u516D\u8DEF:["jinhongliulu","jhll"],\u91D1\u9E3F\u516D\u8DEF\u5317:["jinhongliulubei","jhllb"],\u91D1\u9E3F\u516D\u8DEF\u53E3:["jinhongliulukou","jhllk"],\u91D1\u9E3F\u56DB\u8DEF:["jinhongsilu","jhsl"],\u91D1\u9F0E:["jinding","jd"],"\u91D1\u9F0E(\u4E0B\u5BA2\u533A)":["jinding(xiakequ)","jd(xkq)"],\u91D1\u9F0E\u4E2D\u5B66:["jindingzhongxue","jdzx"],\u91D1\u9F0E\u4E2D\u5B66\u5317:["jindingzhongxuebei","jdzxb"],\u91D1\u9F0E\u4E2D\u5B66\u8DEF:["jindingzhongxuelu","jdzxl"],\u91D1\u9F0E\u5DE5\u4E1A\u56ED:["jindinggongyeyuan","jdgyy"],\u91D1\u9F0E\u5E02\u573A:["jindingshichang","jdsc"],\u91D1\u9F0E\u6587\u5316\u4F53\u80B2\u5E7F\u573A:["jindingwenhuatiyuguangchang","jdwhtygc"],\u91D1\u9F0E\u6587\u5316\u5E7F\u573A:["jindingwenhuaguangchang","jdwhgc"],\u91D1\u9F0E\u9547:["jindingzhen","jdz"],\u946B\u68A6\u56ED:["xinmengyuan","xmy"],\u946B\u8302\u6C64\u5305\u738B:["xinmaotangbaowang","xmtbw"],\u9547\u6B63\u5751\u6C34\u5E93:["zhenzhengkengshuiku","zzksk"],\u957F\u5357\u8FF3\u53E4\u9053\u5317:["changnanjinggudaobei","cnjgdb"],\u957F\u56ED\u7535\u529B:["changyuandianli","cydl"],\u95FB\u521B\u8DEF:["wenchuanglu","wcl"],\u95FB\u77E5\u8DEF:["wenzhilu","wzl"],"\u963F\u59E8\u70E7\u814A \u732A\u811A":["ayishaola zhujiao","aysl zj"],\u9694\u79BB\u67F1:["gelizhu","glz"],\u96FE\u9C9C:["wuxian","wx"],\u971E\u5357\u8857:["xiananjie","xnj"],\u9752\u5E74\u6559\u5E08\u516C\u5BD3:["qingnianjiaoshigongyu","qnjsgy"],\u9752\u79BE\u5DF7\u88E1:["qinghexiangli","qhxl"],\u987A\u4E30\u901F\u8FD0:["shunfengsuyun","sfsy"],\u987A\u5FB7\u5E72\u84B8\u83DC:["shundeganzhengcai","sdgzc"],\u98CE\u96E8\u64CD\u573A:["fengyucaochang","fycc"],\u98DF\u5176\u5BB6:["shiqijia","sqj"],\u98DF\u5802:["shitang","st"],\u9910\u5385:["canting","ct"],\u996D\u5E08\u5144:["fanshixiong","fsx"],\u9999\u5C71\u4F1A\u8BAE\u4E2D\u5FC3:["xiangshanhuiyizhongxin","xshyzx"],\u9999\u5C71\u8DEF:["xiangshanlu","xsl"],\u9999\u5C71\u8DEF\u897F:["xiangshanluxi","xslx"],\u9999\u6A1F\u56ED:["xiangzhangyuan","xzy"],\u9999\u6D32\u70B8\u6392\u9AA8:["xiangzhouzhapaigu","xzzpg"],\u9999\u7EAF\u8336\u6808:["xiangchunchazhan","xccz"],\u9AD8\u624B\u5364\u8089\u996D:["gaoshouluroufan","gslrf"],\u9AD8\u65B0\u533A\u4EBA\u6C11\u533B\u9662:["gaoxinqurenminyiyuan","gxqrmyy"],\u9AD8\u65B0\u533A\u79FB\u6C11\u4E8B\u52A1\u670D\u52A1\u4E2D\u5FC3:["gaoxinquyiminshiwufuwuzhongxin","gxqymswfwzx"],\u9AD8\u65B0\u533A\u91D1\u9F0E\u7B2C\u4E00\u5C0F\u5B66:["gaoxinqujindingdiyixiaoxue","gxqjddyxx"],"\u9AD8\u65B0\u533A\uFF08\u6B63\u5751\u6C34\u5E93\uFF09\u751F\u6D3B\u5783\u573E\u8F6C\u8FD0\u7AD9":["gaoxinqu\uFF08zhengkengshuiku\uFF09shenghuolajizhuanyunzhan","gxq\uFF08zksk\uFF09shljzyz"],\u9AD8\u7B49\u7814\u7A76\u9662:["gaodengyanjiuyuan","gdyjy"],\u9E3F\u65B0\u8857\u53E3:["hongxinjiekou","hxjk"],\u9EA6\u5F53\u52B3:["maidanglao","mdl"],\u9EBB\u8FA3\u70EB:["malatang","mlt"],\u9EBB\u8FA3\u9999\u9505:["malaxiangguo","mlxg"],\u9EC4\u5927\u53A8\u9EBB\u8FA3\u70EB:["huangdachumalatang","hdcmlt"],\u9EC4\u6587\u79C0\u5E7F\u573A:["huangwenxiuguangchang","hwxgc"],\u9EC4\u7116\u9E21\u7C73\u996D:["huangmenjimifan","hmjmf"]};var uu;async function tf(i){i.some(e=>!Object.hasOwn(Lo,e))&&(uu=(await import("./chunks/esm-NUV22FAU.js")).pinyin)}function nf(i){if(Object.hasOwn(Lo,i))return Lo[i];if(!uu)throw Error("Search spelling was not prepared");let e=uu(i,{toneType:"none",type:"array"});return[e.join(""),e.map(t=>t[0]||"").join("")]}var Zn={dormitory:"\u5BBF\u820D\u697C",university:"\u6559\u5B66\u697C",building:"\u5176\u4ED6\u5EFA\u7B51",restaurant:"\u9910\u5385",cafe:"\u5496\u5561\u4E0E\u8336\u996E",food_court:"\u98DF\u5802",fast_food:"\u5FEB\u9910",shop:"\u5546\u5E97",office:"\u529E\u516C\u5BA4",parking:"\u505C\u8F66\u573A",bicycle_parking:"\u81EA\u884C\u8F66\u505C\u8F66\u5904",parking_entrance:"\u505C\u8F66\u573A\u5165\u53E3",toilets:"\u6D17\u624B\u95F4",atm:"ATM",drinking_water:"\u996E\u6C34\u5904",bench:"\u4F11\u606F\u5EA7\u6905",defibrillator:"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668",fire_hydrant:"\u6D88\u9632\u6813",fire_station:"\u6D88\u9632\u7AD9",lost_property_office:"\u5931\u7269\u62DB\u9886\u5904",waste_disposal:"\u5783\u573E\u56DE\u6536\u70B9",waste_transfer_station:"\u5783\u573E\u4E2D\u8F6C\u7AD9",healthcare:"\u533B\u7597",tourism:"\u6587\u5316\u666F\u70B9",leisure:"\u4F11\u95F2\u8BBE\u65BD",entrance:"\u51FA\u5165\u53E3",amenity:"\u5176\u4ED6\u8BBE\u65BD",other:"\u5176\u4ED6\u5730\u70B9",bus_stop:"\u516C\u4EA4\u7AD9",road:"\u9053\u8DEF",public_transport:"\u516C\u5171\u4EA4\u901A",library:"\u56FE\u4E66\u9986",school:"\u5B66\u6821",college:"\u5B66\u9662",bank:"\u94F6\u884C",post_office:"\u90AE\u653F\u4E0E\u5FEB\u9012",parcel_locker:"\u5FEB\u9012\u67DC",shelter:"\u906E\u96E8\u68DA",waste_basket:"\u5783\u573E\u6876",charging_station:"\u5145\u7535\u7AD9",pitch:"\u8FD0\u52A8\u573A",garden:"\u82B1\u56ED",park:"\u516C\u56ED",sports_centre:"\u4F53\u80B2\u4E2D\u5FC3",swimming_pool:"\u6E38\u6CF3\u6C60",stadium:"\u4F53\u80B2\u573A",playground:"\u6E38\u4E50\u573A",golf_course:"\u9AD8\u5C14\u592B\u7403\u573A",gate:"\u51FA\u5165\u53E3",lift_gate:"\u9053\u95F8",bollard:"\u9694\u79BB\u67F1",water:"\u6C34\u57DF",peak:"\u5C71\u5CF0",place:"\u5730\u540D"};function qi(i={}){return i.highway==="bus_stop"?"bus_stop":i.highway==="road"?"road":i.public_transport||i.railway?"public_transport":i.emergency?Zn[i.emergency]?i.emergency:"amenity":i.healthcare||["hospital","clinic","pharmacy","doctors","dentist"].includes(i.amenity)?"healthcare":i.shop?"shop":i.office?i.office==="lost_property"?"lost_property_office":"office":i.amenity&&Zn[i.amenity]?i.amenity:i.building?["dormitory","university"].includes(i.building)?i.building:"building":i.entrance?"entrance":i.barrier&&Zn[i.barrier]?i.barrier:i.natural&&Zn[i.natural]?i.natural:i.place?"place":i.tourism?"tourism":i.leisure?Zn[i.leisure]?i.leisure:"leisure":i.amenity?"amenity":"other"}function hu(i={}){return i.amenity==="atm"?[i.operator||i.brand,"ATM"].filter(Boolean).join(" "):Zn[qi(i)]||"\u672A\u547D\u540D\u5730\u70B9"}function Ng(i){let e=i.tags||{};return[["\u82F1\u6587\u540D\u79F0",i.name_en],["\u7C7B\u578B",Zn[qi(e)]],["\u6240\u5728\u5EFA\u7B51",i.building_name],["\u697C\u5C42",i.floor||e["level:ref"]||e.level],["\u4F4D\u7F6E",[e["addr:street"],e["addr:housenumber"],e["addr:unit"],e["addr:door"]].filter(Boolean).join(" \xB7 ")],["\u8425\u4E1A\u65F6\u95F4",e.opening_hours],["\u8BBE\u65BD",e.amenity],["\u5EFA\u7B51\u7528\u9014",e.building!=="yes"?e.building:null],["\u5546\u5E97\u7C7B\u578B",e.shop],["\u54C1\u724C",e.brand],["\u8FD0\u8425\u65B9",e.operator],["\u83DC\u7CFB",e.cuisine],["\u5E94\u6025\u8BBE\u65BD",e.emergency],["\u8BBE\u5907\u4F4D\u7F6E",e["defibrillator:location"]],["\u7535\u8BDD",e.phone||e["contact:phone"]],["\u90AE\u7BB1",e.email||e["contact:email"]],["\u7F51\u7AD9",e.website||e["contact:website"]],["\u901A\u884C\u6761\u4EF6",e.access],["\u65E0\u969C\u788D",e.wheelchair],["\u5907\u6CE8",e.note],["\u63CF\u8FF0",e.description],["\u5730\u56FE\u5750\u6807",Number.isFinite(i.lon)&&Number.isFinite(i.lat)?`${i.lon.toFixed(6)}, ${i.lat.toFixed(6)}`:null]].filter(([,t])=>t!=null&&String(t).trim())}function Fg(i,e){let t=String(e).trim();if(i==="\u7F51\u7AD9")try{let n=new URL(t);if(["http:","https:"].includes(n.protocol))return n.href}catch{}return i==="\u7535\u8BDD"&&/^[+\d\s();-]{3,70}$/.test(t)?"tel:"+t.replace(/[\s()]/g,""):i==="\u90AE\u7BB1"&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(t)?"mailto:"+encodeURIComponent(t):null}function du(i,e){let t=document.createElement("dl");for(let[a,o]of Ng(e)){let l=document.createElement("dt"),c=document.createElement("dd");l.textContent=a;let u=Fg(a,o);if(u){let h=document.createElement("a");h.textContent=o,h.href=u,u.startsWith("http")&&(h.target="_blank",h.rel="noreferrer"),c.append(h)}else c.textContent=o;t.append(l,c)}i.append(t);let n=document.createElement("details");n.className="part-records";let s=document.createElement("summary");s.textContent="\u5168\u90E8\u516C\u5F00\u5C5E\u6027",n.append(s);let r=document.createElement("dl");for(let[a,o]of Object.entries(e.tags||{})){let l=document.createElement("dt"),c=document.createElement("dd");l.textContent=a,c.textContent=o,r.append(l,c)}if(n.append(r),i.append(n),e.mapSources?.length){let a=document.createElement("details");a.className="part-records";let o=document.createElement("summary");o.textContent="\u6E90\u5730\u56FE\u5730\u70B9\u4FE1\u606F",a.append(o);let l=document.createElement("p");l.textContent=e.vectorOnly?"\u4F4D\u7F6E\u91C7\u7528\u6E90\u5730\u56FE\u6807\u6CE8\u70B9\uFF1B\u697C\u5C42\u672A\u6807\u6CE8\u65F6\u4FDD\u6301\u7A7A\u767D\u3002":"\u5DF2\u4E0E\u539F\u6709\u5730\u70B9\u5408\u5E76\uFF0C\u4FDD\u7559\u539F\u59CB\u5750\u6807\u4E0E\u516C\u5F00\u5C5E\u6027\u3002",a.append(l);for(let c of e.mapSources){let u=document.createElement("p");u.textContent=`${c.dataset==="full"?"\u5B8C\u6574\u5730\u56FE":"\u57FA\u7840\u5730\u56FE"} \xB7 ${c.layer}`,a.append(u);let h=document.createElement("dl");for(let[d,f]of Object.entries(c.properties)){let m=document.createElement("dt"),_=document.createElement("dd");m.textContent=d,_.textContent=String(f),h.append(m,_)}a.append(h)}i.append(a)}}var li=[["all","\u5168\u90E8"],["dining","\u9910\u996E"],["shop","\u5546\u5E97"],["transport","\u4EA4\u901A"],["health","\u533B\u7597"],["facility","\u8BBE\u65BD"],["office","\u529E\u516C"],["leisure","\u4F11\u95F2"],["culture","\u6587\u5316"],["entrance","\u5165\u53E3"],["other","\u5176\u4ED6"]];function Og(i){return i.highway==="bus_stop"||i.public_transport||i.railway||i.highway==="road"?"transport":i.emergency||i.healthcare||["clinic","hospital","pharmacy","doctors","dentist"].includes(i.amenity)?"health":["restaurant","cafe","fast_food","food_court","bar","ice_cream"].includes(i.amenity)?"dining":i.shop?"shop":i.office?"office":i.entrance||["gate","lift_gate"].includes(i.barrier)?"entrance":i.tourism?"culture":i.leisure?"leisure":i.amenity?"facility":"other"}function zg(i){let e={defibrillator:"AED \u81EA\u52A8\u4F53\u5916\u9664\u98A4\u5668",fire_hydrant:"\u6D88\u9632\u6813",toilets:"\u6D17\u624B\u95F4",drinking_water:"\u996E\u6C34\u5904",atm:"ATM",bench:"\u4F11\u606F\u5EA7\u6905",parking:"\u505C\u8F66\u573A",bicycle_parking:"\u81EA\u884C\u8F66\u505C\u8F66\u5904",lost_property_office:"\u5931\u7269\u62DB\u9886",entrance:"\u51FA\u5165\u53E3"};return i["name:zh"]||i.name||i["name:en"]||(i.amenity==="atm"?hu(i):null)||e[i.emergency]||e[i.amenity]||(i.entrance?e.entrance:null)||i.brand||hu(i)}function Ti(i,e,t=[113.513,22.358]){let n=Math.PI/180,s=6378137,r=.00669437999014;function a(d,f){let m=f*n,_=d*n,g=s/Math.sqrt(1-r*Math.sin(m)**2);return[g*Math.cos(m)*Math.cos(_),g*Math.cos(m)*Math.sin(_),g*(1-r)*Math.sin(m)]}let o=a(i,e),l=a(...t),c=o.map((d,f)=>d-l[f]),u=t[0]*n,h=t[1]*n;return[-Math.sin(u)*c[0]+Math.cos(u)*c[1],-Math.sin(h)*Math.cos(u)*c[0]-Math.sin(h)*Math.sin(u)*c[1]+Math.cos(h)*c[2]]}function sf(i,e){let t=!1;for(let n=0,s=e.length-1;n<e.length;s=n++){let r=e[n],a=e[s];r[1]>i[1]!=a[1]>i[1]&&i[0]<(a[0]-r[0])*(i[1]-r[1])/(a[1]-r[1])+r[0]&&(t=!t)}return t}var fu=new WeakMap;function rf(i,e){let t=new Map(e.map(n=>[n.id,n]));return i.map(n=>{let s=t.get(n.id);return s?{...n,publicPlace:s,mapSources:s.mapSources,name_en:n.name_en||s.name_en,tags:{...n.tags,...s.tags},display_name:n.display_name||(/^未命名/.test(n.name)&&!/^未命名/.test(s.name)?s.name:n.name),aliases:[n.aliases||"",s.name,s.name_en,s.tags.short_name||""].join(" ")}:n})}function pu(i){if(fu.has(i))return fu.get(i);let e=i.display_name||i.name||"",t=i.tags||{},[n,s]=nf(e),r=(li.find(([l])=>l===i.category)?.[1]||"")+" "+Zn[qi(t)],a=(i.mapSources||[]).flatMap(l=>Object.entries(l.properties).filter(([c])=>/name|ref/.test(c)).map(([,c])=>c)),o=[e,i.name_en,i.id,i.aliases,r,n,s,...Object.values(t),...a].join(" ").normalize("NFKC").toLowerCase().replace(/\s+/g,"");return fu.set(i,o),o}function af(i,{query:e="",category:t="all",phase:n="all",floor:s="",favorites:r=null,position:a=null}={}){let o=e.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);return i.filter(l=>(t==="all"||l.category===t)&&(n==="all"||l.phase===n)&&(!s||l.floor===s)&&(!r||r.has(l.id))&&o.every(c=>pu(l).includes(c))).sort((l,c)=>a?Math.hypot(l.centroid[0]-a[0],l.centroid[1]-a[1])-Math.hypot(c.centroid[0]-a[0],c.centroid[1]-a[1]):0)}function of(i,e){let t=new Set;return i.elements.flatMap(n=>{let s=n.lon??n.center?.lon,r=n.lat??n.center?.lat,a=`${n.type}/${n.id}`,o=n.tags||{};if(!Number.isFinite(s)||!Number.isFinite(r)||t.has(a))return[];t.add(a);let l=Ti(s,r);if(Math.hypot(...l)>5e3)return[];let c=e.find(h=>h.geometry.some(d=>sf(l,d.outer)&&!d.holes.some(f=>sf(l,f)))),u=c?.phase||(l[1]<0?"1":"2");return[{id:a,kind:"poi",name:zg(o),name_en:o["name:en"]||"",tags:o,category:Og(o),centroid:l.map(h=>+h.toFixed(4)),lon:s,lat:r,phase:u,floor:String(o["level:ref"]??o.level??""),building_id:c?.id??null,building_name:c?.display_name||c?.name||"",labelHeight:c?(c.display_height_m??c.height_m)+c.base_elevation_m+2:2,source_url:`https://www.openstreetmap.org/${a}`}]})}function lf(i,e){let t=113.513,n=22.358;for(let s=0;s<4;s++){let[r,a]=Ti(t,n),[o,l]=Ti(t+1e-5,n),[c,u]=Ti(t,n+1e-5),h=(o-r)/1e-5,d=(c-r)/1e-5,f=(l-a)/1e-5,m=(u-a)/1e-5,_=h*m-d*f;t+=((i-r)*m-(e-a)*d)/_,n+=((e-a)*h-(i-r)*f)/_}return{lon:t,lat:n}}function cf({controls:i,focus:e}){let t=document.querySelector("#open-reference-map"),n=document.createElement("dialog");n.className="reference-map-dialog",n.setAttribute("aria-label","\u5B8C\u6574\u5730\u56FE\u8D44\u6E90"),document.body.append(n);let s;t.onclick=()=>{s=document.createElement("iframe"),s.title="\u5B8C\u6574\u6821\u56ED\u77E2\u91CF\u5730\u56FE",s.src="/campus-map/viewer/reference-map.html",s.onload=()=>s.contentWindow.postMessage({type:"reference-map-focus",...lf(i.target.x,-i.target.z)},location.origin),n.replaceChildren(s),n.showModal()},n.addEventListener("close",()=>{s?.remove(),s=null}),window.addEventListener("message",r=>{if(!s||r.source!==s.contentWindow||r.origin!==location.origin)return;let a=r.data;if(a?.type==="reference-map-ready"&&s.contentWindow.postMessage({type:"reference-map-focus",...lf(i.target.x,-i.target.z)},location.origin),a?.type==="reference-map-close"&&n.close(),a?.type==="reference-map-locate"&&Number.isFinite(a.lon)&&Number.isFinite(a.lat)){let o=Ti(a.lon,a.lat);if(Math.hypot(...o)>6500)return;n.close(),e(o,a.id)}})}function uf(i,e){let t=new Map(i.map(n=>[n.id,n]));for(let n of e?.places||[]){let s=t.get(n.id);s?t.set(n.id,{...s,mapSources:n.mapSources}):t.set(n.id,n)}return[...t.values()]}function hf(i,e,{query:t="",scope:n="buildings",category:s="all"}={}){return t.trim()||n!=="buildings"||s!=="all"||e.favoritesOnly?new Set:new Set(i.filter(r=>(e.view==="all"||r.nearby||r.phase===e.view)&&(!e.placeCategories||e.placeCategories.has(r.category))).map(r=>r.id))}var Un={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Nn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ep=0,oh=1,tp=2;var Ja=1,np=2,_i=3,ni=0,Jt=1,Mn=2,zt=0,ws=1,lh=2,ch=3,uh=4,Cl=5,Dn=100,ip=101,sp=102,rp=103,ap=104,ks=200,op=201,lp=202,cp=203,ll=204,cl=205,Qa=206,up=207,eo=208,hp=209,dp=210,fp=211,pp=212,mp=213,gp=214,Pl=0,Il=1,Dl=2,Es=3,Ll=4,Ul=5,Nl=6,Fl=7,hh=0,_p=1,yp=2,Vi=0,Ol=1,zl=2,Bl=3,Fr=4,kl=5,Hl=6,Vl=7,ju="attached",xp="detached",dh=300,Hs=301,Vs=302,Or=303,Gl=304,to=306,kt=1e3,Wn=1001,gr=1002,Ft=1003,Wl=1004;var Gs=1005;var Lt=1006,zr=1007;var Sn=1008;var Fn=1009,fh=1010,ph=1011,Br=1012,jl=1013,ss=1014,ln=1015,Ut=1016,ql=1017,Xl=1018,rs=1020,mh=35902,gh=35899,_h=1021,yh=1022,_n=1023,_r=1026,as=1027,Yl=1028,$l=1029,xh=1030,Zl=1031;var Kl=1033,no=33776,io=33777,so=33778,ro=33779,Jl=35840,Ql=35841,ec=35842,tc=35843,nc=36196,ic=37492,sc=37496,rc=37808,ac=37809,oc=37810,lc=37811,cc=37812,uc=37813,hc=37814,dc=37815,fc=37816,pc=37817,mc=37818,gc=37819,_c=37820,yc=37821,xc=36492,vc=36494,bc=36495,Mc=36283,Sc=36284,wc=36285,Ec=36286;var Ts=2300,As=2301,ol=2302,qu=2400,Xu=2401,Yu=2402,vp=2500;var vh=0,ao=1,kr=2,bp=3200,Mp=3201;var Tc=0,Sp=1,On="",Rt="srgb",Ht="srgb-linear",ma="linear",ht="srgb";var Ss=7680;var $u=519,wp=512,Ep=513,Tp=514,bh=515,Ap=516,Rp=517,Cp=518,Pp=519,ul=35044,Mh=35048;var Sh="300 es",ti=2e3,ga=2001;var ui=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],df=1234567,ha=Math.PI/180,Rs=180/Math.PI;function jn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function wh(i,e){return(i%e+e)%e}function Bg(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function kg(i,e,t){return i!==e?(t-i)/(e-i):0}function da(i,e,t){return(1-t)*i+t*e}function Hg(i,e,t,n){return da(i,e,1-Math.exp(-t*n))}function Vg(i,e=1){return e-Math.abs(wh(i,e*2)-e)}function Gg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Wg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function jg(i,e){return i+Math.floor(Math.random()*(e-i+1))}function qg(i,e){return i+Math.random()*(e-i)}function Xg(i){return i*(.5-Math.random())}function Yg(i){i!==void 0&&(df=i);let e=df+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function $g(i){return i*ha}function Zg(i){return i*Rs}function Kg(i){return(i&i-1)===0&&i!==0}function Jg(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Qg(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function e0(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),m=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*h,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*h,o*c);break;case"ZXZ":i.set(l*h,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*m,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*m,o*c);break;case"ZYZ":i.set(l*m,l*f,o*u,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ei(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function mt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var ft={DEG2RAD:ha,RAD2DEG:Rs,generateUUID:jn,clamp:Xe,euclideanModulo:wh,mapLinear:Bg,inverseLerp:kg,lerp:da,damp:Hg,pingpong:Vg,smoothstep:Gg,smootherstep:Wg,randInt:jg,randFloat:qg,randFloatSpread:Xg,seededRandom:Yg,degToRad:$g,radToDeg:Zg,isPowerOfTwo:Kg,ceilPowerOfTwo:Jg,floorPowerOfTwo:Qg,setQuaternionFromProperEuler:e0,normalize:mt,denormalize:ei},ce=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Kt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],d=r[a+0],f=r[a+1],m=r[a+2],_=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==m){let g=1-o,p=l*d+c*f+u*m+h*_,b=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let E=Math.sqrt(x),A=Math.atan2(E,p*b);g=Math.sin(g*A)/E,o=Math.sin(o*A)/E}let y=o*b;if(l=l*g+d*y,c=c*g+f*y,u=u*g+m*y,h=h*g+_*y,g===1-o){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],f=r[a+2],m=r[a+3];return e[t]=o*m+u*h+l*f-c*d,e[t+1]=l*m+u*d+c*h-o*f,e[t+2]=c*m+u*f+o*d-l*h,e[t+3]=u*m-o*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),f=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h-d*f*m;break;case"YXZ":this._x=d*u*h+c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h+d*f*m;break;case"ZXY":this._x=d*u*h-c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h-d*f*m;break;case"ZYX":this._x=d*u*h-c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h+d*f*m;break;case"YZX":this._x=d*u*h+c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h-d*f*m;break;case"XZY":this._x=d*u*h-c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h+d*f*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>h){let f=2*Math.sqrt(1+n-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){let f=2*Math.sqrt(1+o-n-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let l=1-o*o;if(l<=Number.EPSILON){let f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ff.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ff.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return mu.copy(this).projectOnVector(e),this.sub(mu)}reflect(e){return this.sub(mu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},mu=new C,ff=new Kt,Ye=class i{constructor(e,t,n,s,r,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],m=n[8],_=s[0],g=s[3],p=s[6],b=s[1],x=s[4],y=s[7],E=s[2],A=s[5],I=s[8];return r[0]=a*_+o*b+l*E,r[3]=a*g+o*x+l*A,r[6]=a*p+o*y+l*I,r[1]=c*_+u*b+h*E,r[4]=c*g+u*x+h*A,r[7]=c*p+u*y+h*I,r[2]=d*_+f*b+m*E,r[5]=d*g+f*x+m*A,r[8]=d*p+f*y+m*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,m=t*h+n*d+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return e[0]=h*_,e[1]=(s*c-u*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(gu.makeScale(e,t)),this}rotate(e){return this.premultiply(gu.makeRotation(-e)),this}translate(e,t){return this.premultiply(gu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},gu=new Ye;function Eh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function yr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ip(){let i=yr("canvas");return i.style.display="block",i}var pf={};function xr(i){i in pf||(pf[i]=!0,console.warn(i))}function Dp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var mf=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gf=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function t0(){let i={enabled:!0,workingColorSpace:Ht,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ht&&(s.r=Ui(s.r),s.g=Ui(s.g),s.b=Ui(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ht&&(s.r=pr(s.r),s.g=pr(s.g),s.b=pr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===On?ma:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return xr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return xr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ht]:{primaries:e,whitePoint:n,transfer:ma,toXYZ:mf,fromXYZ:gf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Rt},outputColorSpaceConfig:{drawingBufferColorSpace:Rt}},[Rt]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:mf,fromXYZ:gf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Rt}}}),i}var Qe=t0();function Ui(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function pr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var er,hl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{er===void 0&&(er=yr("canvas")),er.width=e.width,er.height=e.height;let s=er.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=er}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=yr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ui(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ui(t[n]/255)*255):t[n]=Ui(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},n0=0,vr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:n0++}),this.uuid=jn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(_u(s[a].image)):r.push(_u(s[a]))}else r=_u(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function _u(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?hl.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var i0=0,yu=new C,$t=class i extends ui{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Wn,s=Wn,r=Lt,a=Sn,o=_n,l=Fn,c=i.DEFAULT_ANISOTROPY,u=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:i0++}),this.uuid=jn(),this.name="",this.source=new vr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(yu).x}get height(){return this.source.getSize(yu).y}get depth(){return this.source.getSize(yu).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==dh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kt:e.x=e.x-Math.floor(e.x);break;case Wn:e.x=e.x<0?0:1;break;case gr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case kt:e.y=e.y-Math.floor(e.y);break;case Wn:e.y=e.y<0?0:1;break;case gr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=dh;$t.DEFAULT_ANISOTROPY=1;var st=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,y=(f+1)/2,E=(p+1)/2,A=(u+d)/4,I=(h+_)/4,R=(m+g)/4;return x>y&&x>E?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=A/n,r=I/n):y>E?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=A/s,r=R/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=I/r,s=R/r),this.set(n,s,r,t),this}let b=Math.sqrt((g-m)*(g-m)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(b)<.001&&(b=1),this.x=(g-m)/b,this.y=(h-_)/b,this.z=(d-u)/b,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},dl=class extends ui{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Lt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new $t(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:Lt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new vr(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vt=class extends dl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},_a=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var fl=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ot=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Kn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Kn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Kn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Kn):Kn.fromBufferAttribute(r,a),Kn.applyMatrix4(e.matrixWorld),this.expandByPoint(Kn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Uo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Uo.copy(n.boundingBox)),Uo.applyMatrix4(e.matrixWorld),this.union(Uo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Kn),Kn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(na),No.subVectors(this.max,na),tr.subVectors(e.a,na),nr.subVectors(e.b,na),ir.subVectors(e.c,na),Xi.subVectors(nr,tr),Yi.subVectors(ir,nr),xs.subVectors(tr,ir);let t=[0,-Xi.z,Xi.y,0,-Yi.z,Yi.y,0,-xs.z,xs.y,Xi.z,0,-Xi.x,Yi.z,0,-Yi.x,xs.z,0,-xs.x,-Xi.y,Xi.x,0,-Yi.y,Yi.x,0,-xs.y,xs.x,0];return!xu(t,tr,nr,ir,No)||(t=[1,0,0,0,1,0,0,0,1],!xu(t,tr,nr,ir,No))?!1:(Fo.crossVectors(Xi,Yi),t=[Fo.x,Fo.y,Fo.z],xu(t,tr,nr,ir,No))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Kn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Kn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ai),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ai=[new C,new C,new C,new C,new C,new C,new C,new C],Kn=new C,Uo=new Ot,tr=new C,nr=new C,ir=new C,Xi=new C,Yi=new C,xs=new C,na=new C,No=new C,Fo=new C,vs=new C;function xu(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){vs.fromArray(i,r);let o=s.x*Math.abs(vs.x)+s.y*Math.abs(vs.y)+s.z*Math.abs(vs.z),l=e.dot(vs),c=t.dot(vs),u=n.dot(vs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var s0=new Ot,ia=new C,vu=new C,vn=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):s0.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ia.subVectors(e,this.center);let t=ia.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ia,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(vu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ia.copy(e.center).add(vu)),this.expandByPoint(ia.copy(e.center).sub(vu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ri=new C,bu=new C,Oo=new C,$i=new C,Mu=new C,zo=new C,Su=new C,hi=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ri)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ri.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ri.copy(this.origin).addScaledVector(this.direction,t),Ri.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){bu.copy(e).add(t).multiplyScalar(.5),Oo.copy(t).sub(e).normalize(),$i.copy(this.origin).sub(bu);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Oo),o=$i.dot(this.direction),l=-$i.dot(Oo),c=$i.lengthSq(),u=Math.abs(1-a*a),h,d,f,m;if(u>0)if(h=a*l-o,d=a*o-l,m=r*u,h>=0)if(d>=-m)if(d<=m){let _=1/u;h*=_,d*=_,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-m?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=m?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(bu).addScaledVector(Oo,d),f}intersectSphere(e,t){Ri.subVectors(e.center,this.origin);let n=Ri.dot(this.direction),s=Ri.dot(Ri)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ri)!==null}intersectTriangle(e,t,n,s,r){Mu.subVectors(t,e),zo.subVectors(n,e),Su.crossVectors(Mu,zo);let a=this.direction.dot(Su),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;$i.subVectors(this.origin,e);let l=o*this.direction.dot(zo.crossVectors($i,zo));if(l<0)return null;let c=o*this.direction.dot(Mu.cross($i));if(c<0||l+c>a)return null;let u=-o*$i.dot(Su);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Re=class i{constructor(e,t,n,s,r,a,o,l,c,u,h,d,f,m,_,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,h,d,f,m,_,g)}set(e,t,n,s,r,a,o,l,c,u,h,d,f,m,_,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/sr.setFromMatrixColumn(e,0).length(),r=1/sr.setFromMatrixColumn(e,1).length(),a=1/sr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=a*u,f=a*h,m=o*u,_=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+m*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,m=c*u,_=c*h;t[0]=d+_*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-m,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,m=c*u,_=c*h;t[0]=d-_*o,t[4]=-a*h,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*u,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*u,f=a*h,m=o*u,_=o*h;t[0]=l*u,t[4]=m*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*u,t[4]=_-d*h,t[8]=m*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*h+m,t[10]=d-_*h}else if(e.order==="XZY"){let d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=a*u,t[9]=f*h-m,t[2]=m*h-f,t[6]=o*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(r0,e,a0)}lookAt(e,t,n){let s=this.elements;return Pn.subVectors(e,t),Pn.lengthSq()===0&&(Pn.z=1),Pn.normalize(),Zi.crossVectors(n,Pn),Zi.lengthSq()===0&&(Math.abs(n.z)===1?Pn.x+=1e-4:Pn.z+=1e-4,Pn.normalize(),Zi.crossVectors(n,Pn)),Zi.normalize(),Bo.crossVectors(Pn,Zi),s[0]=Zi.x,s[4]=Bo.x,s[8]=Pn.x,s[1]=Zi.y,s[5]=Bo.y,s[9]=Pn.y,s[2]=Zi.z,s[6]=Bo.z,s[10]=Pn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],m=n[2],_=n[6],g=n[10],p=n[14],b=n[3],x=n[7],y=n[11],E=n[15],A=s[0],I=s[4],R=s[8],S=s[12],M=s[1],P=s[5],L=s[9],N=s[13],z=s[2],V=s[6],B=s[10],ie=s[14],G=s[3],oe=s[7],le=s[11],Me=s[15];return r[0]=a*A+o*M+l*z+c*G,r[4]=a*I+o*P+l*V+c*oe,r[8]=a*R+o*L+l*B+c*le,r[12]=a*S+o*N+l*ie+c*Me,r[1]=u*A+h*M+d*z+f*G,r[5]=u*I+h*P+d*V+f*oe,r[9]=u*R+h*L+d*B+f*le,r[13]=u*S+h*N+d*ie+f*Me,r[2]=m*A+_*M+g*z+p*G,r[6]=m*I+_*P+g*V+p*oe,r[10]=m*R+_*L+g*B+p*le,r[14]=m*S+_*N+g*ie+p*Me,r[3]=b*A+x*M+y*z+E*G,r[7]=b*I+x*P+y*V+E*oe,r[11]=b*R+x*L+y*B+E*le,r[15]=b*S+x*N+y*ie+E*Me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],m=e[3],_=e[7],g=e[11],p=e[15];return m*(+r*l*h-s*c*h-r*o*d+n*c*d+s*o*f-n*l*f)+_*(+t*l*f-t*c*d+r*a*d-s*a*f+s*c*u-r*l*u)+g*(+t*c*h-t*o*f-r*a*h+n*a*f+r*o*u-n*c*u)+p*(-s*o*u-t*l*h+t*o*d+s*a*h-n*a*d+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],m=e[12],_=e[13],g=e[14],p=e[15],b=h*g*c-_*d*c+_*l*f-o*g*f-h*l*p+o*d*p,x=m*d*c-u*g*c-m*l*f+a*g*f+u*l*p-a*d*p,y=u*_*c-m*h*c+m*o*f-a*_*f-u*o*p+a*h*p,E=m*h*l-u*_*l-m*o*d+a*_*d+u*o*g-a*h*g,A=t*b+n*x+s*y+r*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/A;return e[0]=b*I,e[1]=(_*d*r-h*g*r-_*s*f+n*g*f+h*s*p-n*d*p)*I,e[2]=(o*g*r-_*l*r+_*s*c-n*g*c-o*s*p+n*l*p)*I,e[3]=(h*l*r-o*d*r-h*s*c+n*d*c+o*s*f-n*l*f)*I,e[4]=x*I,e[5]=(u*g*r-m*d*r+m*s*f-t*g*f-u*s*p+t*d*p)*I,e[6]=(m*l*r-a*g*r-m*s*c+t*g*c+a*s*p-t*l*p)*I,e[7]=(a*d*r-u*l*r+u*s*c-t*d*c-a*s*f+t*l*f)*I,e[8]=y*I,e[9]=(m*h*r-u*_*r-m*n*f+t*_*f+u*n*p-t*h*p)*I,e[10]=(a*_*r-m*o*r+m*n*c-t*_*c-a*n*p+t*o*p)*I,e[11]=(u*o*r-a*h*r-u*n*c+t*h*c+a*n*f-t*o*f)*I,e[12]=E*I,e[13]=(u*_*s-m*h*s+m*n*d-t*_*d-u*n*g+t*h*g)*I,e[14]=(m*o*s-a*_*s-m*n*l+t*_*l+a*n*g-t*o*g)*I,e[15]=(a*h*s-u*o*s+u*n*l-t*h*l-a*n*d+t*o*d)*I,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,m=r*h,_=a*u,g=a*h,p=o*h,b=l*c,x=l*u,y=l*h,E=n.x,A=n.y,I=n.z;return s[0]=(1-(_+p))*E,s[1]=(f+y)*E,s[2]=(m-x)*E,s[3]=0,s[4]=(f-y)*A,s[5]=(1-(d+p))*A,s[6]=(g+b)*A,s[7]=0,s[8]=(m+x)*I,s[9]=(g-b)*I,s[10]=(1-(d+_))*I,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=sr.set(s[0],s[1],s[2]).length(),a=sr.set(s[4],s[5],s[6]).length(),o=sr.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Jn.copy(this);let c=1/r,u=1/a,h=1/o;return Jn.elements[0]*=c,Jn.elements[1]*=c,Jn.elements[2]*=c,Jn.elements[4]*=u,Jn.elements[5]*=u,Jn.elements[6]*=u,Jn.elements[8]*=h,Jn.elements[9]*=h,Jn.elements[10]*=h,t.setFromRotationMatrix(Jn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=ti,l=!1){let c=this.elements,u=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),m,_;if(l)m=r/(a-r),_=a*r/(a-r);else if(o===ti)m=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===ga)m=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=ti,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),m,_;if(l)m=1/(a-r),_=a/(a-r);else if(o===ti)m=-2/(a-r),_=-(a+r)/(a-r);else if(o===ga)m=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},sr=new C,Jn=new Re,r0=new C(0,0,0),a0=new C(1,1,1),Zi=new C,Bo=new C,Pn=new C,_f=new Re,yf=new Kt,ii=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return _f.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_f,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return yf.setFromEuler(this),this.setFromQuaternion(yf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ii.DEFAULT_ORDER="XYZ";var br=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},o0=0,xf=new C,rr=new Kt,Ci=new Re,ko=new C,sa=new C,l0=new C,c0=new Kt,vf=new C(1,0,0),bf=new C(0,1,0),Mf=new C(0,0,1),Sf={type:"added"},u0={type:"removed"},ar={type:"childadded",child:null},wu={type:"childremoved",child:null},Et=class i extends ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:o0++}),this.uuid=jn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new C,t=new ii,n=new Kt,s=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Re},normalMatrix:{value:new Ye}}),this.matrix=new Re,this.matrixWorld=new Re,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new br,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return rr.setFromAxisAngle(e,t),this.quaternion.multiply(rr),this}rotateOnWorldAxis(e,t){return rr.setFromAxisAngle(e,t),this.quaternion.premultiply(rr),this}rotateX(e){return this.rotateOnAxis(vf,e)}rotateY(e){return this.rotateOnAxis(bf,e)}rotateZ(e){return this.rotateOnAxis(Mf,e)}translateOnAxis(e,t){return xf.copy(e).applyQuaternion(this.quaternion),this.position.add(xf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vf,e)}translateY(e){return this.translateOnAxis(bf,e)}translateZ(e){return this.translateOnAxis(Mf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ci.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ko.copy(e):ko.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),sa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ci.lookAt(sa,ko,this.up):Ci.lookAt(ko,sa,this.up),this.quaternion.setFromRotationMatrix(Ci),s&&(Ci.extractRotation(s.matrixWorld),rr.setFromRotationMatrix(Ci),this.quaternion.premultiply(rr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Sf),ar.child=e,this.dispatchEvent(ar),ar.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(u0),wu.child=e,this.dispatchEvent(wu),wu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ci.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ci.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ci),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Sf),ar.child=e,this.dispatchEvent(ar),ar.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sa,e,l0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sa,c0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Et.DEFAULT_UP=new C(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qn=new C,Pi=new C,Eu=new C,Ii=new C,or=new C,lr=new C,wf=new C,Tu=new C,Au=new C,Ru=new C,Cu=new st,Pu=new st,Iu=new st,Qi=class i{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Qn.subVectors(e,t),s.cross(Qn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Qn.subVectors(s,t),Pi.subVectors(n,t),Eu.subVectors(e,t);let a=Qn.dot(Qn),o=Qn.dot(Pi),l=Qn.dot(Eu),c=Pi.dot(Pi),u=Pi.dot(Eu),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(c*l-o*u)*d,m=(a*u-o*l)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ii)===null?!1:Ii.x>=0&&Ii.y>=0&&Ii.x+Ii.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ii.x),l.addScaledVector(a,Ii.y),l.addScaledVector(o,Ii.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Cu.setScalar(0),Pu.setScalar(0),Iu.setScalar(0),Cu.fromBufferAttribute(e,t),Pu.fromBufferAttribute(e,n),Iu.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Cu,r.x),a.addScaledVector(Pu,r.y),a.addScaledVector(Iu,r.z),a}static isFrontFacing(e,t,n,s){return Qn.subVectors(n,t),Pi.subVectors(e,t),Qn.cross(Pi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qn.subVectors(this.c,this.b),Pi.subVectors(this.a,this.b),Qn.cross(Pi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;or.subVectors(s,n),lr.subVectors(r,n),Tu.subVectors(e,n);let l=or.dot(Tu),c=lr.dot(Tu);if(l<=0&&c<=0)return t.copy(n);Au.subVectors(e,s);let u=or.dot(Au),h=lr.dot(Au);if(u>=0&&h<=u)return t.copy(s);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(or,a);Ru.subVectors(e,r);let f=or.dot(Ru),m=lr.dot(Ru);if(m>=0&&f<=m)return t.copy(r);let _=f*c-l*m;if(_<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(lr,o);let g=u*m-f*h;if(g<=0&&h-u>=0&&f-m>=0)return wf.subVectors(r,s),o=(h-u)/(h-u+(f-m)),t.copy(s).addScaledVector(wf,o);let p=1/(g+_+d);return a=_*p,o=d*p,t.copy(n).addScaledVector(or,a).addScaledVector(lr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Lp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ki={h:0,s:0,l:0},Ho={h:0,s:0,l:0};function Du(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ie=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Rt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Qe.workingColorSpace){if(e=wh(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Du(a,r,e+1/3),this.g=Du(a,r,e),this.b=Du(a,r,e-1/3)}return Qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Rt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Rt){let n=Lp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}copyLinearToSRGB(e){return this.r=pr(e.r),this.g=pr(e.g),this.b=pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Rt){return Qe.workingToColorSpace(rn.copy(this),e),Math.round(Xe(rn.r*255,0,255))*65536+Math.round(Xe(rn.g*255,0,255))*256+Math.round(Xe(rn.b*255,0,255))}getHexString(e=Rt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(rn.copy(this),t);let n=rn.r,s=rn.g,r=rn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Rt){Qe.workingToColorSpace(rn.copy(this),e);let t=rn.r,n=rn.g,s=rn.b;return e!==Rt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ki),this.setHSL(Ki.h+e,Ki.s+t,Ki.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ki),e.getHSL(Ho);let n=da(Ki.h,Ho.h,t),s=da(Ki.s,Ho.s,t),r=da(Ki.l,Ho.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new Ie;Ie.NAMES=Lp;var h0=0,gn=class extends ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:h0++}),this.uuid=jn(),this.name="",this.type="Material",this.blending=ws,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ll,this.blendDst=cl,this.blendEquation=Dn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=Es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=$u,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ss,this.stencilZFail=Ss,this.stencilZPass=Ss,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ws&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ll&&(n.blendSrc=this.blendSrc),this.blendDst!==cl&&(n.blendDst=this.blendDst),this.blendEquation!==Dn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Es&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==$u&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ss&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ss&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ss&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Gt=class extends gn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ii,this.combine=hh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Li=d0();function d0(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,s[l]=24,s[l|256]=24):(n[l]=31744,n[l|256]=64512,s[l]=13,s[l|256]=13)}let r=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,u=0;for(;(c&8388608)===0;)c<<=1,u-=8388608;c&=-8388609,u+=947912704,r[l]=c|u}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:s,mantissaTable:r,exponentTable:a,offsetTable:o}}function f0(i){Math.abs(i)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),i=Xe(i,-65504,65504),Li.floatView[0]=i;let e=Li.uint32View[0],t=e>>23&511;return Li.baseTable[t]+((e&8388607)>>Li.shiftTable[t])}function p0(i){let e=i>>10;return Li.uint32View[0]=Li.mantissaTable[Li.offsetTable[e]+(i&1023)]+Li.exponentTable[e],Li.floatView[0]}var es=class{static toHalfFloat(e){return f0(e)}static fromHalfFloat(e){return p0(e)}},Nt=new C,Vo=new ce,m0=0,ut=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:m0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ul,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Vo.fromBufferAttribute(this,t),Vo.applyMatrix3(e),this.setXY(t,Vo.x,Vo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix3(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix4(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyNormalMatrix(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.transformDirection(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ei(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=mt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ei(t,this.array)),t}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ei(t,this.array)),t}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ei(t,this.array)),t}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ei(t,this.array)),t}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array),s=mt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array),s=mt(s,this.array),r=mt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ul&&(e.usage=this.usage),e}};var ya=class extends ut{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var xa=class extends ut{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var rt=class extends ut{constructor(e,t,n){super(new Float32Array(e),t,n)}},g0=0,Gn=new Re,Lu=new Et,cr=new C,In=new Ot,ra=new Ot,Yt=new C,gt=class i extends ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:g0++}),this.uuid=jn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Eh(e)?xa:ya)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Gn.makeRotationFromQuaternion(e),this.applyMatrix4(Gn),this}rotateX(e){return Gn.makeRotationX(e),this.applyMatrix4(Gn),this}rotateY(e){return Gn.makeRotationY(e),this.applyMatrix4(Gn),this}rotateZ(e){return Gn.makeRotationZ(e),this.applyMatrix4(Gn),this}translate(e,t,n){return Gn.makeTranslation(e,t,n),this.applyMatrix4(Gn),this}scale(e,t,n){return Gn.makeScale(e,t,n),this.applyMatrix4(Gn),this}lookAt(e){return Lu.lookAt(e),Lu.updateMatrix(),this.applyMatrix4(Lu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(cr).negate(),this.translate(cr.x,cr.y,cr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new rt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ot);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];In.setFromBufferAttribute(r),this.morphTargetsRelative?(Yt.addVectors(this.boundingBox.min,In.min),this.boundingBox.expandByPoint(Yt),Yt.addVectors(this.boundingBox.max,In.max),this.boundingBox.expandByPoint(Yt)):(this.boundingBox.expandByPoint(In.min),this.boundingBox.expandByPoint(In.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let n=this.boundingSphere.center;if(In.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];ra.setFromBufferAttribute(o),this.morphTargetsRelative?(Yt.addVectors(In.min,ra.min),In.expandByPoint(Yt),Yt.addVectors(In.max,ra.max),In.expandByPoint(Yt)):(In.expandByPoint(ra.min),In.expandByPoint(ra.max))}In.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Yt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Yt.fromBufferAttribute(o,c),l&&(cr.fromBufferAttribute(e,c),Yt.add(cr)),s=Math.max(s,n.distanceToSquared(Yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ut(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let R=0;R<n.count;R++)o[R]=new C,l[R]=new C;let c=new C,u=new C,h=new C,d=new ce,f=new ce,m=new ce,_=new C,g=new C;function p(R,S,M){c.fromBufferAttribute(n,R),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,M),d.fromBufferAttribute(r,R),f.fromBufferAttribute(r,S),m.fromBufferAttribute(r,M),u.sub(c),h.sub(c),f.sub(d),m.sub(d);let P=1/(f.x*m.y-m.x*f.y);isFinite(P)&&(_.copy(u).multiplyScalar(m.y).addScaledVector(h,-f.y).multiplyScalar(P),g.copy(h).multiplyScalar(f.x).addScaledVector(u,-m.x).multiplyScalar(P),o[R].add(_),o[S].add(_),o[M].add(_),l[R].add(g),l[S].add(g),l[M].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let R=0,S=b.length;R<S;++R){let M=b[R],P=M.start,L=M.count;for(let N=P,z=P+L;N<z;N+=3)p(e.getX(N+0),e.getX(N+1),e.getX(N+2))}let x=new C,y=new C,E=new C,A=new C;function I(R){E.fromBufferAttribute(s,R),A.copy(E);let S=o[R];x.copy(S),x.sub(E.multiplyScalar(E.dot(S))).normalize(),y.crossVectors(A,S);let P=y.dot(l[R])<0?-1:1;a.setXYZW(R,x.x,x.y,x.z,P)}for(let R=0,S=b.length;R<S;++R){let M=b[R],P=M.start,L=M.count;for(let N=P,z=P+L;N<z;N+=3)I(e.getX(N+0)),I(e.getX(N+1)),I(e.getX(N+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ut(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,u=new C,h=new C;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),_=e.getX(d+1),g=e.getX(d+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,g),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),o.add(u),l.add(u),c.add(u),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Yt.fromBufferAttribute(e,t),Yt.normalize(),e.setXYZ(t,Yt.x,Yt.y,Yt.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u),f=0,m=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*u;for(let p=0;p<u;p++)d[m++]=c[f++]}return new ut(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ef=new Re,bs=new hi,Go=new vn,Tf=new C,Wo=new C,jo=new C,qo=new C,Uu=new C,Xo=new C,Af=new C,Yo=new C,it=class extends Et{constructor(e=new gt,t=new Gt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Xo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],h=r[l];u!==0&&(Uu.fromBufferAttribute(h,e),a?Xo.addScaledVector(Uu,u):Xo.addScaledVector(Uu.sub(t),u))}t.add(Xo)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Go.copy(n.boundingSphere),Go.applyMatrix4(r),bs.copy(e.ray).recast(e.near),!(Go.containsPoint(bs.origin)===!1&&(bs.intersectSphere(Go,Tf)===null||bs.origin.distanceToSquared(Tf)>(e.far-e.near)**2))&&(Ef.copy(r).invert(),bs.copy(e.ray).applyMatrix4(Ef),!(n.boundingBox!==null&&bs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,bs)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=a[g.materialIndex],b=Math.max(g.start,f.start),x=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let y=b,E=x;y<E;y+=3){let A=o.getX(y),I=o.getX(y+1),R=o.getX(y+2);s=$o(this,p,e,n,c,u,h,A,I,R),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){let b=o.getX(g),x=o.getX(g+1),y=o.getX(g+2);s=$o(this,a,e,n,c,u,h,b,x,y),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=a[g.materialIndex],b=Math.max(g.start,f.start),x=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let y=b,E=x;y<E;y+=3){let A=y,I=y+1,R=y+2;s=$o(this,p,e,n,c,u,h,A,I,R),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){let b=g,x=g+1,y=g+2;s=$o(this,a,e,n,c,u,h,b,x,y),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function _0(i,e,t,n,s,r,a,o){let l;if(e.side===Jt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ni,o),l===null)return null;Yo.copy(o),Yo.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Yo);return c<t.near||c>t.far?null:{distance:c,point:Yo.clone(),object:i}}function $o(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Wo),i.getVertexPosition(l,jo),i.getVertexPosition(c,qo);let u=_0(i,e,t,n,Wo,jo,qo,Af);if(u){let h=new C;Qi.getBarycoord(Af,Wo,jo,qo,h),s&&(u.uv=Qi.getInterpolatedAttribute(s,o,l,c,h,new ce)),r&&(u.uv1=Qi.getInterpolatedAttribute(r,o,l,c,h,new ce)),a&&(u.normal=Qi.getInterpolatedAttribute(a,o,l,c,h,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new C,materialIndex:0};Qi.getNormal(Wo,jo,qo,d.normal),u.face=d,u.barycoord=h}return u}var ts=class i extends gt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],h=[],d=0,f=0;m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,s,a,2),m("x","z","y",1,-1,e,n,-t,s,a,3),m("x","y","z",1,-1,e,t,n,s,r,4),m("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(h,2));function m(_,g,p,b,x,y,E,A,I,R,S){let M=y/I,P=E/R,L=y/2,N=E/2,z=A/2,V=I+1,B=R+1,ie=0,G=0,oe=new C;for(let le=0;le<B;le++){let Me=le*P-N;for(let Ae=0;Ae<V;Ae++){let Ne=Ae*M-L;oe[_]=Ne*b,oe[g]=Me*x,oe[p]=z,c.push(oe.x,oe.y,oe.z),oe[_]=0,oe[g]=0,oe[p]=A>0?1:-1,u.push(oe.x,oe.y,oe.z),h.push(Ae/I),h.push(1-le/R),ie+=1}}for(let le=0;le<R;le++)for(let Me=0;Me<I;Me++){let Ae=d+Me+V*le,Ne=d+Me+V*(le+1),Ve=d+(Me+1)+V*(le+1),fe=d+(Me+1)+V*le;l.push(Ae,Ne,fe),l.push(Ne,Ve,fe),G+=6}o.addGroup(f,G,S),f+=G,d+=ie}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ws(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function cn(i){let e={};for(let t=0;t<i.length;t++){let n=Ws(i[t]);for(let s in n)e[s]=n[s]}return e}function y0(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Th(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}var un={clone:Ws,merge:cn},x0=`void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,v0=`void main() {
  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,St=class extends gn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=x0,this.fragmentShader=v0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ws(e.uniforms),this.uniformsGroups=y0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},va=class extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Re,this.projectionMatrix=new Re,this.projectionMatrixInverse=new Re,this.coordinateSystem=ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ji=new C,Rf=new ce,Cf=new ce,It=class extends va{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Rs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ha*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Rs*2*Math.atan(Math.tan(ha*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ji.x,Ji.y).multiplyScalar(-e/Ji.z),Ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ji.x,Ji.y).multiplyScalar(-e/Ji.z)}getViewSize(e,t){return this.getViewBounds(e,Rf,Cf),t.subVectors(Cf,Rf)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ha*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ur=-90,hr=1,Mr=class extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new It(ur,hr,e,t);s.layers=this.layers,this.add(s);let r=new It(ur,hr,e,t);r.layers=this.layers,this.add(r);let a=new It(ur,hr,e,t);a.layers=this.layers,this.add(a);let o=new It(ur,hr,e,t);o.layers=this.layers,this.add(o);let l=new It(ur,hr,e,t);l.layers=this.layers,this.add(l);let c=new It(ur,hr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===ti)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ga)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},ba=class extends $t{constructor(e=[],t=Hs,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Sr=class extends Vt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ba(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
      `},s=new ts(5,5,5),r=new St({name:"CubemapFromEquirect",uniforms:Ws(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:zt});r.uniforms.tEquirect.value=t;let a=new it(s,r),o=t.minFilter;return t.minFilter===Sn&&(t.minFilter=Lt),new Mr(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},Dt=class extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}},b0={type:"move"},wr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Dt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Dt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Dt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let g=t.getJointPose(_,n),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(b0)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Dt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Er=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ie(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Cs=class extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ii,this.environmentIntensity=1,this.environmentRotation=new ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Tr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ul,this.updateRanges=[],this.version=0,this.uuid=jn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},mn=new C,Ar=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyMatrix4(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyNormalMatrix(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.transformDirection(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ei(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=mt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ei(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ei(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ei(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ei(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array),s=mt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),n=mt(n,this.array),s=mt(s,this.array),r=mt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new ut(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var Pf=new C,If=new st,Df=new st,M0=new C,Lf=new Re,Zo=new C,Nu=new vn,Uf=new Re,Fu=new hi,Ma=class extends it{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ju,this.bindMatrix=new Re,this.bindMatrixInverse=new Re,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ot),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Zo),this.boundingBox.expandByPoint(Zo)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Zo),this.boundingSphere.expandByPoint(Zo)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Nu.copy(this.boundingSphere),Nu.applyMatrix4(s),e.ray.intersectsSphere(Nu)!==!1&&(Uf.copy(s).invert(),Fu.copy(e.ray).applyMatrix4(Uf),!(this.boundingBox!==null&&Fu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Fu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new st,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ju?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===xp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;If.fromBufferAttribute(s.attributes.skinIndex,e),Df.fromBufferAttribute(s.attributes.skinWeight,e),Pf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let a=Df.getComponent(r);if(a!==0){let o=If.getComponent(r);Lf.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(M0.copy(Pf).applyMatrix4(Lf),a)}}return t.applyMatrix4(this.bindMatrixInverse)}},Rr=class extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}},di=class extends $t{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ft,u=Ft,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Nf=new Re,S0=new Re,Sa=class i{constructor(e=[],t=[]){this.uuid=jn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Re)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Re;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:S0;Nf.multiplyMatrices(o,t[r]),Nf.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new di(t,e,e,_n,ln);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new Rr),this.bones.push(a),this.boneInverses.push(new Re().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},ns=class extends ut{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},dr=new Re,Ff=new Re,Ko=[],Of=new Ot,w0=new Re,aa=new it,oa=new vn,wa=class extends it{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ns(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,w0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ot),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,dr),Of.copy(e.boundingBox).applyMatrix4(dr),this.boundingBox.union(Of)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,dr),oa.copy(e.boundingSphere).applyMatrix4(dr),this.boundingSphere.union(oa)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(aa.geometry=this.geometry,aa.material=this.material,aa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),oa.copy(this.boundingSphere),oa.applyMatrix4(n),e.ray.intersectsSphere(oa)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,dr),Ff.multiplyMatrices(n,dr),aa.matrixWorld=Ff,aa.raycast(e,Ko);for(let a=0,o=Ko.length;a<o;a++){let l=Ko[a];l.instanceId=r,l.object=this,t.push(l)}Ko.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ns(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new di(new Float32Array(s*this.count),s,this.count,Yl,ln));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ou=new C,E0=new C,T0=new Ye,an=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Ou.subVectors(n,t).cross(E0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Ou),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||T0.getNormalMatrix(e),s=this.coplanarPoint(Ou).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ms=new vn,A0=new ce(.5,.5),Jo=new C,is=class{constructor(e=new an,t=new an,n=new an,s=new an,r=new an,a=new an){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ti,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],m=r[8],_=r[9],g=r[10],p=r[11],b=r[12],x=r[13],y=r[14],E=r[15];if(s[0].setComponents(c-a,f-u,p-m,E-b).normalize(),s[1].setComponents(c+a,f+u,p+m,E+b).normalize(),s[2].setComponents(c+o,f+h,p+_,E+x).normalize(),s[3].setComponents(c-o,f-h,p-_,E-x).normalize(),n)s[4].setComponents(l,d,g,y).normalize(),s[5].setComponents(c-l,f-d,p-g,E-y).normalize();else if(s[4].setComponents(c-l,f-d,p-g,E-y).normalize(),t===ti)s[5].setComponents(c+l,f+d,p+g,E+y).normalize();else if(t===ga)s[5].setComponents(l,d,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ms.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ms.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ms)}intersectsSprite(e){Ms.center.set(0,0,0);let t=A0.distanceTo(e.center);return Ms.radius=.7071067811865476+t,Ms.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ms)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Jo.x=s.normal.x>0?e.max.x:e.min.x,Jo.y=s.normal.y>0?e.max.y:e.min.y,Jo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Jo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var fi=class extends gn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ie(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},pl=new C,ml=new C,zf=new Re,la=new hi,Qo=new vn,zu=new C,Bf=new C,Ps=class extends Et{constructor(e=new gt,t=new fi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)pl.fromBufferAttribute(t,s-1),ml.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=pl.distanceTo(ml);e.setAttribute("lineDistance",new rt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Qo.copy(n.boundingSphere),Qo.applyMatrix4(s),Qo.radius+=r,e.ray.intersectsSphere(Qo)===!1)return;zf.copy(s).invert(),la.copy(e.ray).applyMatrix4(zf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let f=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){let p=u.getX(_),b=u.getX(_+1),x=el(this,e,la,l,p,b,_);x&&t.push(x)}if(this.isLineLoop){let _=u.getX(m-1),g=u.getX(f),p=el(this,e,la,l,_,g,m-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){let p=el(this,e,la,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){let _=el(this,e,la,l,m-1,f,m-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function el(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(pl.fromBufferAttribute(o,s),ml.fromBufferAttribute(o,r),t.distanceSqToSegment(pl,ml,zu,Bf)>n)return;zu.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(zu);if(!(c<e.near||c>e.far))return{distance:c,point:Bf.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var kf=new C,Hf=new C,Ni=class extends Ps{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)kf.fromBufferAttribute(t,s),Hf.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+kf.distanceTo(Hf);e.setAttribute("lineDistance",new rt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ea=class extends Ps{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Cr=class extends gn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Vf=new Re,Zu=new hi,tl=new vn,nl=new C,Ta=class extends Et{constructor(e=new gt,t=new Cr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),tl.copy(n.boundingSphere),tl.applyMatrix4(s),tl.radius+=r,e.ray.intersectsSphere(tl)===!1)return;Vf.copy(s).invert(),Zu.copy(e.ray).applyMatrix4(Vf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,_=f;m<_;m++){let g=c.getX(m);nl.fromBufferAttribute(h,g),Gf(nl,g,l,s,e,t,this)}}else{let d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let m=d,_=f;m<_;m++)nl.fromBufferAttribute(h,m),Gf(nl,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Gf(i,e,t,n,s,r,a){let o=Zu.distanceSqToPoint(i);if(o<t){let l=new C;Zu.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Is=class extends $t{constructor(e,t,n=ss,s,r,a,o=Ft,l=Ft,c,u=_r,h=1){if(u!==_r&&u!==as)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Aa=class extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var gl=class i extends gt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],m=0,_=[],g=n/2,p=0;b(),a===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new rt(h,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(f,2));function b(){let y=new C,E=new C,A=0,I=(t-e)/n;for(let R=0;R<=r;R++){let S=[],M=R/r,P=M*(t-e)+e;for(let L=0;L<=s;L++){let N=L/s,z=N*l+o,V=Math.sin(z),B=Math.cos(z);E.x=P*V,E.y=-M*n+g,E.z=P*B,h.push(E.x,E.y,E.z),y.set(V,I,B).normalize(),d.push(y.x,y.y,y.z),f.push(N,1-M),S.push(m++)}_.push(S)}for(let R=0;R<s;R++)for(let S=0;S<r;S++){let M=_[S][R],P=_[S+1][R],L=_[S+1][R+1],N=_[S][R+1];(e>0||S!==0)&&(u.push(M,P,N),A+=3),(t>0||S!==r-1)&&(u.push(P,L,N),A+=3)}c.addGroup(p,A,0),p+=A}function x(y){let E=m,A=new ce,I=new C,R=0,S=y===!0?e:t,M=y===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,g*M,0),d.push(0,M,0),f.push(.5,.5),m++;let P=m;for(let L=0;L<=s;L++){let z=L/s*l+o,V=Math.cos(z),B=Math.sin(z);I.x=S*B,I.y=g*M,I.z=S*V,h.push(I.x,I.y,I.z),d.push(0,M,0),A.x=V*.5+.5,A.y=B*.5*M+.5,f.push(A.x,A.y),m++}for(let L=0;L<s;L++){let N=E+L,z=P+L;y===!0?u.push(z,z+1,N):u.push(z+1,z,N),R+=3}c.addGroup(p,R,y===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ra=class i extends gl{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Ln=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let u=n[s],d=n[s+1]-u,f=(a-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new ce:new C);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new C,s=[],r=[],a=[],o=new C,l=new Re;for(let f=0;f<=e;f++){let m=f/e;s[f]=this.getTangentAt(m,new C)}r[0]=new C,a[0]=new C;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(Xe(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Xe(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Pr=class extends Ln{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ce){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},_l=class extends Pr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Ah(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,h){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+h)+(l-o)/h;d*=u,f*=u,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var il=new C,Bu=new Ah,ku=new Ah,Hu=new Ah,yl=class extends Ln{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new C){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(il.subVectors(s[0],s[1]).add(s[0]),c=il);let h=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(il.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=il),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),f),_=Math.pow(h.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(u),f);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),Bu.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,m,_,g),ku.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,m,_,g),Hu.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,m,_,g)}else this.curveType==="catmullrom"&&(Bu.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),ku.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Hu.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Bu.calc(l),ku.calc(l),Hu.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new C().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Wf(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function R0(i,e){let t=1-i;return t*t*e}function C0(i,e){return 2*(1-i)*i*e}function P0(i,e){return i*i*e}function fa(i,e,t,n){return R0(i,e)+C0(i,t)+P0(i,n)}function I0(i,e){let t=1-i;return t*t*t*e}function D0(i,e){let t=1-i;return 3*t*t*i*e}function L0(i,e){return 3*(1-i)*i*i*e}function U0(i,e){return i*i*i*e}function pa(i,e,t,n,s){return I0(i,e)+D0(i,t)+L0(i,n)+U0(i,s)}var Ca=class extends Ln{constructor(e=new ce,t=new ce,n=new ce,s=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new ce){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(pa(e,s.x,r.x,a.x,o.x),pa(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},xl=class extends Ln{constructor(e=new C,t=new C,n=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new C){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(pa(e,s.x,r.x,a.x,o.x),pa(e,s.y,r.y,a.y,o.y),pa(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Pa=class extends Ln{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ir=class extends Ln{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ia=class extends Ln{constructor(e=new ce,t=new ce,n=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ce){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(fa(e,s.x,r.x,a.x),fa(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Da=class extends Ln{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(fa(e,s.x,r.x,a.x),fa(e,s.y,r.y,a.y),fa(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},La=class extends Ln{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return n.set(Wf(o,l.x,c.x,u.x,h.x),Wf(o,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new ce().fromArray(s))}return this}},Ku=Object.freeze({__proto__:null,ArcCurve:_l,CatmullRomCurve3:yl,CubicBezierCurve:Ca,CubicBezierCurve3:xl,EllipseCurve:Pr,LineCurve:Pa,LineCurve3:Ir,QuadraticBezierCurve:Ia,QuadraticBezierCurve3:Da,SplineCurve:La}),Dr=class extends Ln{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ku[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Ku[s.type]().fromJSON(s))}return this}},Ds=class extends Dr{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Pa(this.currentPoint.clone(),new ce(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new Ia(this.currentPoint.clone(),new ce(e,t),new ce(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){let o=new Ca(this.currentPoint.clone(),new ce(e,t),new ce(n,s),new ce(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new La(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){let c=new Pr(e,t,n,s,r,a,o,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Lr=class extends Ds{constructor(e){super(e),this.uuid=jn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Ds().fromJSON(s))}return this}};function N0(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Up(i,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=k0(i,e,r,t)),i.length>80*t){o=1/0,l=1/0;let u=-1/0,h=-1/0;for(let d=t;d<s;d+=t){let f=i[d],m=i[d+1];f<o&&(o=f),m<l&&(l=m),f>u&&(u=f),m>h&&(h=m)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Ua(r,a,t,o,l,c,0),a}function Up(i,e,t,n,s){let r;if(s===K0(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=jf(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=jf(a/n|0,i[a],i[a+1],r);return r&&Ur(r,r.next)&&(Fa(r),r=r.next),r}function Ls(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ur(t,t.next)||Ct(t.prev,t,t.next)===0)){if(Fa(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Ua(i,e,t,n,s,r,a){if(!i)return;!a&&r&&j0(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?O0(i,n,s,r):F0(i)){e.push(l.i,i.i,c.i),Fa(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=z0(Ls(i),e),Ua(i,e,t,n,s,r,2)):a===2&&B0(i,e,t,n,s,r):Ua(Ls(i),e,t,n,s,r,1);break}}}function F0(i){let e=i.prev,t=i,n=i.next;if(Ct(e,t,n)>=0)return!1;let s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c),m=n.next;for(;m!==e;){if(m.x>=u&&m.x<=d&&m.y>=h&&m.y<=f&&ua(s,o,r,l,a,c,m.x,m.y)&&Ct(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function O0(i,e,t,n){let s=i.prev,r=i,a=i.next;if(Ct(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),m=Math.min(u,h,d),_=Math.max(o,l,c),g=Math.max(u,h,d),p=Ju(f,m,e,t,n),b=Ju(_,g,e,t,n),x=i.prevZ,y=i.nextZ;for(;x&&x.z>=p&&y&&y.z<=b;){if(x.x>=f&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&ua(o,u,l,h,c,d,x.x,x.y)&&Ct(x.prev,x,x.next)>=0||(x=x.prevZ,y.x>=f&&y.x<=_&&y.y>=m&&y.y<=g&&y!==s&&y!==a&&ua(o,u,l,h,c,d,y.x,y.y)&&Ct(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;x&&x.z>=p;){if(x.x>=f&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&ua(o,u,l,h,c,d,x.x,x.y)&&Ct(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;y&&y.z<=b;){if(y.x>=f&&y.x<=_&&y.y>=m&&y.y<=g&&y!==s&&y!==a&&ua(o,u,l,h,c,d,y.x,y.y)&&Ct(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function z0(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Ur(n,s)&&Fp(n,t,t.next,s)&&Na(n,s)&&Na(s,n)&&(e.push(n.i,t.i,s.i),Fa(t),Fa(t.next),t=i=s),t=t.next}while(t!==i);return Ls(t)}function B0(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Y0(a,o)){let l=Op(a,o);a=Ls(a,a.next),l=Ls(l,l.next),Ua(a,e,t,n,s,r,0),Ua(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function k0(i,e,t,n){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Up(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(X0(c))}s.sort(H0);for(let r=0;r<s.length;r++)t=V0(s[r],t);return t}function H0(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function V0(i,e){let t=G0(i,e);if(!t)return e;let n=Op(t,i);return Ls(n,n.next),Ls(t,t.next)}function G0(i,e){let t=e,n=i.x,s=i.y,r=-1/0,a;if(Ur(i,t))return t;do{if(Ur(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Np(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let h=Math.abs(s-t.y)/(n-t.x);Na(t,i)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&W0(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function W0(i,e){return Ct(i.prev,i,e.prev)<0&&Ct(e.next,i,i.next)<0}function j0(i,e,t,n){let s=i;do s.z===0&&(s.z=Ju(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,q0(s)}function q0(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Ju(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function X0(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Np(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function ua(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Np(i,e,t,n,s,r,a,o)}function Y0(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!$0(i,e)&&(Na(i,e)&&Na(e,i)&&Z0(i,e)&&(Ct(i.prev,i,e.prev)||Ct(i,e.prev,e))||Ur(i,e)&&Ct(i.prev,i,i.next)>0&&Ct(e.prev,e,e.next)>0)}function Ct(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ur(i,e){return i.x===e.x&&i.y===e.y}function Fp(i,e,t,n){let s=rl(Ct(i,e,t)),r=rl(Ct(i,e,n)),a=rl(Ct(t,n,i)),o=rl(Ct(t,n,e));return!!(s!==r&&a!==o||s===0&&sl(i,t,e)||r===0&&sl(i,n,e)||a===0&&sl(t,i,n)||o===0&&sl(t,e,n))}function sl(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function rl(i){return i>0?1:i<0?-1:0}function $0(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Fp(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Na(i,e){return Ct(i.prev,i,i.next)<0?Ct(i,e,i.next)>=0&&Ct(i,i.prev,e)>=0:Ct(i,e,i.prev)<0||Ct(i,i.next,e)<0}function Z0(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Op(i,e){let t=Qu(i.i,i.x,i.y),n=Qu(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function jf(i,e,t,n){let s=Qu(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Fa(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Qu(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function K0(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var eh=class{static triangulate(e,t,n=2){return N0(e,t,n)}},mr=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];qf(e),Xf(n,e);let a=e.length;t.forEach(qf);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Xf(n,t[l]);let o=eh.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function qf(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Xf(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Fi=class i extends gt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=e/o,d=t/l,f=[],m=[],_=[],g=[];for(let p=0;p<u;p++){let b=p*d-a;for(let x=0;x<c;x++){let y=x*h-r;m.push(y,-b,0),_.push(0,0,1),g.push(x/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<o;b++){let x=b+c*p,y=b+c*(p+1),E=b+1+c*(p+1),A=b+1+c*p;f.push(x,y,A),f.push(y,E,A)}this.setIndex(f),this.setAttribute("position",new rt(m,3)),this.setAttribute("normal",new rt(_,3)),this.setAttribute("uv",new rt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},Oa=class i extends gt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],u=[],h=e,d=(t-e)/s,f=new C,m=new ce;for(let _=0;_<=s;_++){for(let g=0;g<=n;g++){let p=r+g/n*a;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,u.push(m.x,m.y)}h+=d}for(let _=0;_<s;_++){let g=_*(n+1);for(let p=0;p<n;p++){let b=p+g,x=b,y=b+n+1,E=b+n+2,A=b+1;o.push(x,y,A),o.push(y,E,A)}}this.setIndex(o),this.setAttribute("position",new rt(l,3)),this.setAttribute("normal",new rt(c,3)),this.setAttribute("uv",new rt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},za=class i extends gt{constructor(e=new Lr([new ce(0,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],r=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(o,l,u),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new rt(s,3)),this.setAttribute("normal",new rt(r,3)),this.setAttribute("uv",new rt(a,2));function c(u){let h=s.length/3,d=u.extractPoints(t),f=d.shape,m=d.holes;mr.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,p=m.length;g<p;g++){let b=m[g];mr.isClockWise(b)===!0&&(m[g]=b.reverse())}let _=mr.triangulateShape(f,m);for(let g=0,p=m.length;g<p;g++){let b=m[g];f=f.concat(b)}for(let g=0,p=f.length;g<p;g++){let b=f[g];s.push(b.x,b.y,0),r.push(0,0,1),a.push(b.x,b.y)}for(let g=0,p=_.length;g<p;g++){let b=_[g],x=b[0]+h,y=b[1]+h,E=b[2]+h;n.push(x,y,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return J0(t,e)}static fromJSON(e,t){let n=[];for(let s=0,r=e.shapes.length;s<r;s++){let a=t[e.shapes[s]];n.push(a)}return new i(n,e.curveSegments)}};function J0(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var Us=class i extends gt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],h=new C,d=new C,f=[],m=[],_=[],g=[];for(let p=0;p<=n;p++){let b=[],x=p/n,y=0;p===0&&a===0?y=.5/t:p===n&&l===Math.PI&&(y=-.5/t);for(let E=0;E<=t;E++){let A=E/t;h.x=-e*Math.cos(s+A*r)*Math.sin(a+x*o),h.y=e*Math.cos(a+x*o),h.z=e*Math.sin(s+A*r)*Math.sin(a+x*o),m.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),g.push(A+y,1-x),b.push(c++)}u.push(b)}for(let p=0;p<n;p++)for(let b=0;b<t;b++){let x=u[p][b+1],y=u[p][b],E=u[p+1][b],A=u[p+1][b+1];(p!==0||a>0)&&f.push(x,y,A),(p!==n-1||l<Math.PI)&&f.push(y,E,A)}this.setIndex(f),this.setAttribute("position",new rt(m,3)),this.setAttribute("normal",new rt(_,3)),this.setAttribute("uv",new rt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Ba=class i extends gt{constructor(e=new Da(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new C,l=new C,c=new ce,u=new C,h=[],d=[],f=[],m=[];_(),this.setIndex(m),this.setAttribute("position",new rt(h,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(f,2));function _(){for(let x=0;x<t;x++)g(x);g(r===!1?t:0),b(),p()}function g(x){u=e.getPointAt(x/t,u);let y=a.normals[x],E=a.binormals[x];for(let A=0;A<=s;A++){let I=A/s*Math.PI*2,R=Math.sin(I),S=-Math.cos(I);l.x=S*y.x+R*E.x,l.y=S*y.y+R*E.y,l.z=S*y.z+R*E.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=u.x+n*l.x,o.y=u.y+n*l.y,o.z=u.z+n*l.z,h.push(o.x,o.y,o.z)}}function p(){for(let x=1;x<=t;x++)for(let y=1;y<=s;y++){let E=(s+1)*(x-1)+(y-1),A=(s+1)*x+(y-1),I=(s+1)*x+y,R=(s+1)*(x-1)+y;m.push(E,A,R),m.push(A,I,R)}}function b(){for(let x=0;x<=t;x++)for(let y=0;y<=s;y++)c.x=x/t,c.y=y/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Ku[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var ka=class extends St{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Wt=class extends gn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Tc,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ii,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},on=class extends Wt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Xe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ie(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ie(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ie(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Ha=class extends gn{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Tc,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}};var vl=class extends gn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=bp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},bl=class extends gn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function al(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Q0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function e_(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Yf(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function zp(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var Oi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ml=class extends Oi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:qu,endingEnd:qu}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Xu:r=e,o=2*t-n;break;case Yu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Xu:a=e,l=2*n-t;break;case Yu:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-t)/(s-t),_=m*m,g=_*m,p=-d*g+2*d*_-d*m,b=(1+d)*g+(-1.5-2*d)*_+(-.5+d)*m+1,x=(-1-f)*g+(1.5+f)*_+.5*m,y=f*g-f*_;for(let E=0;E!==o;++E)r[E]=p*a[u+E]+b*a[c+E]+x*a[l+E]+y*a[h+E];return r}},Sl=class extends Oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==o;++d)r[d]=a[c+d]*h+a[l+d]*u;return r}},wl=class extends Oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},bn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=al(t,this.TimeBufferType),this.values=al(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:al(e.times,Array),values:al(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new wl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Sl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ml(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ts:t=this.InterpolantFactoryMethodDiscrete;break;case As:t=this.InterpolantFactoryMethodLinear;break;case ol:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ts;case this.InterpolantFactoryMethodLinear:return As;case this.InterpolantFactoryMethodSmooth:return ol}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Q0(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ol,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let h=o*n,d=h-n,f=h+n;for(let m=0;m!==n;++m){let _=t[h+m];if(_!==t[d+m]||_!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};bn.prototype.ValueTypeName="";bn.prototype.TimeBufferType=Float32Array;bn.prototype.ValueBufferType=Float32Array;bn.prototype.DefaultInterpolation=As;var zi=class extends bn{constructor(e,t,n){super(e,t,n)}};zi.prototype.ValueTypeName="bool";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=Ts;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Va=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};Va.prototype.ValueTypeName="color";var pi=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};pi.prototype.ValueTypeName="number";var El=class extends Oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)Kt.slerpFlat(r,0,a,c-o,a,c,l);return r}},mi=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new El(this.times,this.values,this.getValueSize(),e)}};mi.prototype.ValueTypeName="quaternion";mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Bi=class extends bn{constructor(e,t,n){super(e,t,n)}};Bi.prototype.ValueTypeName="string";Bi.prototype.ValueBufferType=Array;Bi.prototype.DefaultInterpolation=Ts;Bi.prototype.InterpolantFactoryMethodLinear=void 0;Bi.prototype.InterpolantFactoryMethodSmooth=void 0;var gi=class extends bn{constructor(e,t,n,s){super(e,t,n,s)}};gi.prototype.ValueTypeName="vector";var Ga=class{constructor(e="",t=-1,n=[],s=vp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=jn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(n_(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(bn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let u=e_(l);l=Yf(l,1,u),c=Yf(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new pi(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],u=c.name.match(r);if(u&&u.length>1){let h=u[1],d=s[h];d||(s[h]=d=[]),d.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,d,f,m,_){if(f.length!==0){let g=[],p=[];zp(f,g,p,m),g.length!==0&&_.push(new h(d,g,p))}},s=[],r=e.name||"default",a=e.fps||30,o=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let h=0;h<c.length;h++){let d=c[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let _=0;_<d[m].morphTargets.length;_++)f[d[m].morphTargets[_]]=-1;for(let _ in f){let g=[],p=[];for(let b=0;b!==d[m].morphTargets.length;++b){let x=d[m];g.push(x.time),p.push(x.morphTarget===_?1:0)}s.push(new pi(".morphTargetInfluence["+_+"]",g,p))}l=f.length*a}else{let f=".bones["+t[h].name+"]";n(gi,f+".position",d,"pos",s),n(mi,f+".quaternion",d,"rot",s),n(gi,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,l,s,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function t_(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return pi;case"vector":case"vector2":case"vector3":case"vector4":return gi;case"color":return Va;case"quaternion":return mi;case"bool":case"boolean":return zi;case"string":return Bi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function n_(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=t_(i.type);if(i.times===void 0){let t=[],n=[];zp(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var ci={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Tl=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],m=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Bp=new Tl,si=class{constructor(e){this.manager=e!==void 0?e:Bp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};si.DEFAULT_MATERIAL_NAME="__DEFAULT";var Di={},th=class extends Error{constructor(e,t){super(e),this.response=t}},Ns=class extends si{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ci.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Di[e]!==void 0){Di[e].push({onLoad:t,onProgress:n,onError:s});return}Di[e]=[],Di[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Di[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,m=f!==0,_=0,g=new ReadableStream({start(p){b();function b(){h.read().then(({done:x,value:y})=>{if(x)p.close();else{_+=y.byteLength;let E=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:f});for(let A=0,I=u.length;A<I;A++){let R=u[A];R.onProgress&&R.onProgress(E)}p.enqueue(y),b()}},x=>{p.error(x)})}}});return new Response(g)}else throw new th(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(m=>f.decode(m))}}}).then(c=>{ci.add(`file:${e}`,c);let u=Di[e];delete Di[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{let u=Di[e];if(u===void 0)throw this.manager.itemError(e),c;delete Di[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var fr=new WeakMap,Al=class extends si{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ci.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=fr.get(a);h===void 0&&(h=[],fr.set(a,h)),h.push({onLoad:t,onError:s})}return a}let o=yr("img");function l(){u(),t&&t(this);let h=fr.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}fr.delete(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),ci.remove(`image:${e}`);let d=fr.get(this)||[];for(let f=0;f<d.length;f++){let m=d[f];m.onError&&m.onError(h)}fr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ci.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var Wa=class extends si{constructor(e){super(e)}load(e,t,n,s){let r=this,a=new di,o=new Ns(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){let c;try{c=r.parse(l)}catch(u){if(s!==void 0)s(u);else{console.error(u);return}}c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:Wn,a.wrapT=c.wrapT!==void 0?c.wrapT:Wn,a.magFilter=c.magFilter!==void 0?c.magFilter:Lt,a.minFilter=c.minFilter!==void 0?c.minFilter:Lt,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(a.colorSpace=c.colorSpace),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=Sn),c.mipmapCount===1&&(a.minFilter=Lt),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c)},n,s),a}},Fs=class extends si{constructor(e){super(e)}load(e,t,n,s){let r=new $t,a=new Al(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Os=class extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},ja=class extends Os{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ie(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Vu=new Re,$f=new C,Zf=new C,qa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=Fn,this.map=null,this.mapPass=null,this.matrix=new Re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new is,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;$f.setFromMatrixPosition(e.matrixWorld),t.position.copy($f),Zf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Zf),t.updateMatrixWorld(),Vu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vu,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Vu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},nh=class extends qa{constructor(){super(new It(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Rs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Xa=class extends Os{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new nh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Kf=new Re,ca=new C,Gu=new C,ih=class extends qa{constructor(){super(new It(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ce(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ca.setFromMatrixPosition(e.matrixWorld),n.position.copy(ca),Gu.copy(n.position),Gu.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Gu),n.updateMatrixWorld(),s.makeTranslation(-ca.x,-ca.y,-ca.z),Kf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kf,n.coordinateSystem,n.reversedDepth)}},Ya=class extends Os{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ih}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},ki=class extends va{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},sh=class extends qa{constructor(){super(new ki(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},zs=class extends Os{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new sh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Hi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Wu=new WeakMap,$a=class extends si{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ci.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{if(Wu.has(a)===!0)s&&s(Wu.get(a)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ci.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Wu.set(l,c),ci.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ci.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Rl=class extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Za=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Rh="\\[\\]\\.:\\/",i_=new RegExp("["+Rh+"]","g"),Ch="[^"+Rh+"]",s_="[^"+Rh.replace("\\.","")+"]",r_=/((?:WC+[\/:])*)/.source.replace("WC",Ch),a_=/(WCOD+)?/.source.replace("WCOD",s_),o_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ch),l_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ch),c_=new RegExp("^"+r_+a_+o_+l_+"$"),u_=["material","materials","bones","map"],rh=class{constructor(e,t,n){let s=n||vt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},vt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(i_,"")}static parseTrackName(e){let t=c_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);u_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};vt.Composite=rh;vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};vt.prototype.GetterByBindingType=[vt.prototype._getValue_direct,vt.prototype._getValue_array,vt.prototype._getValue_arrayElement,vt.prototype._getValue_toArray];vt.prototype.SetterByBindingTypeAndVersioning=[[vt.prototype._setValue_direct,vt.prototype._setValue_direct_setNeedsUpdate,vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_array,vt.prototype._setValue_array_setNeedsUpdate,vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_arrayElement,vt.prototype._setValue_arrayElement_setNeedsUpdate,vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_fromArray,vt.prototype._setValue_fromArray_setNeedsUpdate,vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Kb=new Float32Array(1);var Jf=new Re,Bs=class{constructor(e,t,n=0,s=1/0){this.ray=new hi(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new br,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Jf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Jf),this}intersectObject(e,t=!0,n=[]){return ah(e,this,n,t),n.sort(Qf),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)ah(e[s],this,n,t);return n.sort(Qf),n}};function Qf(i,e){return i.distance-e.distance}function ah(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)ah(r[a],e,t,!0)}}var Nr=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Xe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Xe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Ka=class extends ui{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Ph(i,e,t,n){let s=h_(n);switch(t){case _h:return i*e;case Yl:return i*e/s.components*s.byteLength;case $l:return i*e/s.components*s.byteLength;case xh:return i*e*2/s.components*s.byteLength;case Zl:return i*e*2/s.components*s.byteLength;case yh:return i*e*3/s.components*s.byteLength;case _n:return i*e*4/s.components*s.byteLength;case Kl:return i*e*4/s.components*s.byteLength;case no:case io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case so:case ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ql:case tc:return Math.max(i,16)*Math.max(e,8)/4;case Jl:case ec:return Math.max(i,8)*Math.max(e,8)/2;case nc:case ic:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case rc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ac:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case oc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case lc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case cc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case uc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case hc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case dc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case fc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case pc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case mc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case gc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case _c:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case yc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case xc:case vc:case bc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Mc:case Sc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case wc:case Ec:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function h_(i){switch(i){case Fn:case fh:return{byteLength:1,components:1};case Br:case ph:case Ut:return{byteLength:2,components:1};case ql:case Xl:return{byteLength:2,components:4};case ss:case jl:case ln:return{byteLength:4,components:1};case mh:case gh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function cm(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function f_(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<h.length;f++){let m=h[d],_=h[f];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,m=h.length;f<m;f++){let _=h[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var p_=`#ifdef USE_ALPHAHASH
  if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,m_=`#ifdef USE_ALPHAHASH
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
#endif`,g_=`#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,__=`#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,y_=`#ifdef USE_ALPHATEST
  #ifdef ALPHA_TO_COVERAGE
  diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
  if ( diffuseColor.a == 0.0 ) discard;
  #else
  if ( diffuseColor.a < alphaTest ) discard;
  #endif
#endif`,x_=`#ifdef USE_ALPHATEST
  uniform float alphaTest;
#endif`,v_=`#ifdef USE_AOMAP
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
#endif`,b_=`#ifdef USE_AOMAP
  uniform sampler2D aoMap;
  uniform float aoMapIntensity;
#endif`,M_=`#ifdef USE_BATCHING
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
#endif`,S_=`#ifdef USE_BATCHING
  mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,w_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
  vPosition = vec3( position );
#endif`,E_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif`,T_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,A_=`#ifdef USE_IRIDESCENCE
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
#endif`,R_=`#ifdef USE_BUMPMAP
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
#endif`,C_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,P_=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
  uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,I_=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
#endif`,D_=`#if NUM_CLIPPING_PLANES > 0
  vClipPosition = - mvPosition.xyz;
#endif`,L_=`#if defined( USE_COLOR_ALPHA )
  diffuseColor *= vColor;
#elif defined( USE_COLOR )
  diffuseColor.rgb *= vColor;
#endif`,U_=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR )
  varying vec3 vColor;
#endif`,N_=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  varying vec3 vColor;
#endif`,F_=`#if defined( USE_COLOR_ALPHA )
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
#endif`,O_=`#define PI 3.141592653589793
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
} // validated`,z_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,B_=`vec3 transformedNormal = objectNormal;
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
#endif`,k_=`#ifdef USE_DISPLACEMENTMAP
  uniform sampler2D displacementMap;
  uniform float displacementScale;
  uniform float displacementBias;
#endif`,H_=`#ifdef USE_DISPLACEMENTMAP
  transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,V_=`#ifdef USE_EMISSIVEMAP
  vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
  #ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
    emissiveColor = sRGBTransferEOTF( emissiveColor );
  #endif
  totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,G_=`#ifdef USE_EMISSIVEMAP
  uniform sampler2D emissiveMap;
#endif`,W_="gl_FragColor = linearToOutputTexel( gl_FragColor );",j_=`vec4 LinearTransferOETF( in vec4 value ) {
  return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,q_=`#ifdef USE_ENVMAP
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
#endif`,X_=`#ifdef USE_ENVMAP
  uniform float envMapIntensity;
  uniform float flipEnvMap;
  uniform mat3 envMapRotation;
  #ifdef ENVMAP_TYPE_CUBE
    uniform samplerCube envMap;
  #else
    uniform sampler2D envMap;
  #endif

#endif`,Y_=`#ifdef USE_ENVMAP
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
#endif`,$_=`#ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS

    varying vec3 vWorldPosition;
  #else
    varying vec3 vReflect;
    uniform float refractionRatio;
  #endif
#endif`,Z_=`#ifdef USE_ENVMAP
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
#endif`,K_=`#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
#endif`,J_=`#ifdef USE_FOG
  varying float vFogDepth;
#endif`,Q_=`#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,e1=`#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`,t1=`#ifdef USE_GRADIENTMAP
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
}`,n1=`#ifdef USE_LIGHTMAP
  uniform sampler2D lightMap;
  uniform float lightMapIntensity;
#endif`,i1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,s1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,r1=`uniform bool receiveShadow;
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
#endif`,a1=`#ifdef USE_ENVMAP
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
#endif`,o1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,l1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,c1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,u1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,h1=`PhysicalMaterial material;
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
#endif`,d1=`struct PhysicalMaterial {
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
}`,f1=`
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
#endif`,p1=`#if defined( RE_IndirectDiffuse )
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
#endif`,m1=`#if defined( RE_IndirectDiffuse )
  RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
  RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,g1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  uniform float logDepthBufFC;
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,y1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,x1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  vFragDepth = 1.0 + gl_Position.w;
  vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,v1=`#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
  #endif
  diffuseColor *= sampledDiffuseColor;
#endif`,b1=`#ifdef USE_MAP
  uniform sampler2D map;
#endif`,M1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,S1=`#if defined( USE_POINTS_UV )
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
#endif`,w1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
  vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
  metalnessFactor *= texelMetalness.b;
#endif`,E1=`#ifdef USE_METALNESSMAP
  uniform sampler2D metalnessMap;
#endif`,T1=`#ifdef USE_INSTANCING_MORPH
  float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
  }
#endif`,A1=`#if defined( USE_MORPHCOLORS )
  vColor *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    #if defined( USE_COLOR_ALPHA )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
    #elif defined( USE_COLOR )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
    #endif
  }
#endif`,R1=`#ifdef USE_MORPHNORMALS
  objectNormal *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,C1=`#ifdef USE_MORPHTARGETS
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
#endif`,P1=`#ifdef USE_MORPHTARGETS
  transformed *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,I1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,D1=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,L1=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,U1=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,N1=`#ifndef FLAT_SHADED
  vNormal = normalize( transformedNormal );
  #ifdef USE_TANGENT
    vTangent = normalize( transformedTangent );
    vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
  #endif
#endif`,F1=`#ifdef USE_NORMALMAP
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
#endif`,O1=`#ifdef USE_CLEARCOAT
  vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,z1=`#ifdef USE_CLEARCOAT_NORMALMAP
  vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
  clearcoatMapN.xy *= clearcoatNormalScale;
  clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,B1=`#ifdef USE_CLEARCOATMAP
  uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform sampler2D clearcoatNormalMap;
  uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform sampler2D clearcoatRoughnessMap;
#endif`,k1=`#ifdef USE_IRIDESCENCEMAP
  uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform sampler2D iridescenceThicknessMap;
#endif`,H1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,V1=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,G1=`#ifdef PREMULTIPLIED_ALPHA
  gl_FragColor.rgb *= gl_FragColor.a;
#endif`,W1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,j1=`#ifdef DITHERING
  gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,q1=`#ifdef DITHERING
  vec3 dithering( vec3 color ) {
    float grid_position = rand( gl_FragCoord.xy );
    vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
    dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
    return color + dither_shift_RGB;
  }
#endif`,X1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
  roughnessFactor *= texelRoughness.g;
#endif`,Y1=`#ifdef USE_ROUGHNESSMAP
  uniform sampler2D roughnessMap;
#endif`,$1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Z1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,K1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,J1=`float getShadowMask() {
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
}`,Q1=`#ifdef USE_SKINNING
  mat4 boneMatX = getBoneMatrix( skinIndex.x );
  mat4 boneMatY = getBoneMatrix( skinIndex.y );
  mat4 boneMatZ = getBoneMatrix( skinIndex.z );
  mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ey=`#ifdef USE_SKINNING
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
#endif`,ty=`#ifdef USE_SKINNING
  vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
  vec4 skinned = vec4( 0.0 );
  skinned += boneMatX * skinVertex * skinWeight.x;
  skinned += boneMatY * skinVertex * skinWeight.y;
  skinned += boneMatZ * skinVertex * skinWeight.z;
  skinned += boneMatW * skinVertex * skinWeight.w;
  transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ny=`#ifdef USE_SKINNING
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
#endif`,iy=`float specularStrength;
#ifdef USE_SPECULARMAP
  vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
  specularStrength = texelSpecular.r;
#else
  specularStrength = 1.0;
#endif`,sy=`#ifdef USE_SPECULARMAP
  uniform sampler2D specularMap;
#endif`,ry=`#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ay=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,oy=`#ifdef USE_TRANSMISSION
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
#endif`,ly=`#ifdef USE_TRANSMISSION
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
#endif`,cy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
#endif`,fy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
  vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,py=`uniform sampler2D t2D;
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
}`,my=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,gy=`#ifdef ENVMAP_TYPE_CUBE
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
}`,_y=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,yy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
  vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
  gl_FragColor = texColor;
  gl_FragColor.a *= opacity;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,xy=`#include <common>
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
}`,vy=`#if DEPTH_PACKING == 3200
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
}`,by=`#define DISTANCE
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
}`,My=`#define DISTANCE
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
}`,Sy=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
}`,wy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
  vec3 direction = normalize( vWorldDirection );
  vec2 sampleUV = equirectUv( direction );
  gl_FragColor = texture2D( tEquirect, sampleUV );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Ey=`uniform float scale;
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
}`,Ty=`uniform vec3 diffuse;
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
}`,Ay=`#include <common>
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
}`,Ry=`uniform vec3 diffuse;
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
}`,Cy=`#define LAMBERT
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
}`,Py=`#define LAMBERT
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
}`,Iy=`#define MATCAP
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
}`,Dy=`#define MATCAP
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
}`,Ly=`#define NORMAL
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
}`,Uy=`#define NORMAL
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
}`,Ny=`#define PHONG
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
}`,Fy=`#define PHONG
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
}`,Oy=`#define STANDARD
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
}`,zy=`#define STANDARD
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
}`,By=`#define TOON
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
}`,ky=`#define TOON
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
}`,Hy=`uniform float size;
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
}`,Vy=`uniform vec3 diffuse;
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
}`,Gy=`#include <common>
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
}`,Wy=`uniform vec3 color;
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
}`,jy=`uniform float rotation;
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
}`,qy=`uniform vec3 diffuse;
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
}`,qe={alphahash_fragment:p_,alphahash_pars_fragment:m_,alphamap_fragment:g_,alphamap_pars_fragment:__,alphatest_fragment:y_,alphatest_pars_fragment:x_,aomap_fragment:v_,aomap_pars_fragment:b_,batching_pars_vertex:M_,batching_vertex:S_,begin_vertex:w_,beginnormal_vertex:E_,bsdfs:T_,iridescence_fragment:A_,bumpmap_pars_fragment:R_,clipping_planes_fragment:C_,clipping_planes_pars_fragment:P_,clipping_planes_pars_vertex:I_,clipping_planes_vertex:D_,color_fragment:L_,color_pars_fragment:U_,color_pars_vertex:N_,color_vertex:F_,common:O_,cube_uv_reflection_fragment:z_,defaultnormal_vertex:B_,displacementmap_pars_vertex:k_,displacementmap_vertex:H_,emissivemap_fragment:V_,emissivemap_pars_fragment:G_,colorspace_fragment:W_,colorspace_pars_fragment:j_,envmap_fragment:q_,envmap_common_pars_fragment:X_,envmap_pars_fragment:Y_,envmap_pars_vertex:$_,envmap_physical_pars_fragment:a1,envmap_vertex:Z_,fog_vertex:K_,fog_pars_vertex:J_,fog_fragment:Q_,fog_pars_fragment:e1,gradientmap_pars_fragment:t1,lightmap_pars_fragment:n1,lights_lambert_fragment:i1,lights_lambert_pars_fragment:s1,lights_pars_begin:r1,lights_toon_fragment:o1,lights_toon_pars_fragment:l1,lights_phong_fragment:c1,lights_phong_pars_fragment:u1,lights_physical_fragment:h1,lights_physical_pars_fragment:d1,lights_fragment_begin:f1,lights_fragment_maps:p1,lights_fragment_end:m1,logdepthbuf_fragment:g1,logdepthbuf_pars_fragment:_1,logdepthbuf_pars_vertex:y1,logdepthbuf_vertex:x1,map_fragment:v1,map_pars_fragment:b1,map_particle_fragment:M1,map_particle_pars_fragment:S1,metalnessmap_fragment:w1,metalnessmap_pars_fragment:E1,morphinstance_vertex:T1,morphcolor_vertex:A1,morphnormal_vertex:R1,morphtarget_pars_vertex:C1,morphtarget_vertex:P1,normal_fragment_begin:I1,normal_fragment_maps:D1,normal_pars_fragment:L1,normal_pars_vertex:U1,normal_vertex:N1,normalmap_pars_fragment:F1,clearcoat_normal_fragment_begin:O1,clearcoat_normal_fragment_maps:z1,clearcoat_pars_fragment:B1,iridescence_pars_fragment:k1,opaque_fragment:H1,packing:V1,premultiplied_alpha_fragment:G1,project_vertex:W1,dithering_fragment:j1,dithering_pars_fragment:q1,roughnessmap_fragment:X1,roughnessmap_pars_fragment:Y1,shadowmap_pars_fragment:$1,shadowmap_pars_vertex:Z1,shadowmap_vertex:K1,shadowmask_pars_fragment:J1,skinbase_vertex:Q1,skinning_pars_vertex:ey,skinning_vertex:ty,skinnormal_vertex:ny,specularmap_fragment:iy,specularmap_pars_fragment:sy,tonemapping_fragment:ry,tonemapping_pars_fragment:ay,transmission_fragment:oy,transmission_pars_fragment:ly,uv_pars_fragment:cy,uv_pars_vertex:uy,uv_vertex:hy,worldpos_vertex:dy,background_vert:fy,background_frag:py,backgroundCube_vert:my,backgroundCube_frag:gy,cube_vert:_y,cube_frag:yy,depth_vert:xy,depth_frag:vy,distanceRGBA_vert:by,distanceRGBA_frag:My,equirect_vert:Sy,equirect_frag:wy,linedashed_vert:Ey,linedashed_frag:Ty,meshbasic_vert:Ay,meshbasic_frag:Ry,meshlambert_vert:Cy,meshlambert_frag:Py,meshmatcap_vert:Iy,meshmatcap_frag:Dy,meshnormal_vert:Ly,meshnormal_frag:Uy,meshphong_vert:Ny,meshphong_frag:Fy,meshphysical_vert:Oy,meshphysical_frag:zy,meshtoon_vert:By,meshtoon_frag:ky,points_vert:Hy,points_frag:Vy,shadow_vert:Gy,shadow_frag:Wy,sprite_vert:jy,sprite_frag:qy},ve={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},yi={basic:{uniforms:cn([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:cn([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ie(0)}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:cn([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:cn([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:cn([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Ie(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:cn([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:cn([ve.points,ve.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:cn([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:cn([ve.common,ve.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:cn([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:cn([ve.sprite,ve.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distanceRGBA:{uniforms:cn([ve.common,ve.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distanceRGBA_vert,fragmentShader:qe.distanceRGBA_frag},shadow:{uniforms:cn([ve.lights,ve.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};yi.physical={uniforms:cn([yi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var Ac={r:0,b:0,g:0},js=new ii,Xy=new Re;function Yy(i,e,t,n,s,r,a){let o=new Ie(0),l=r===!0?0:1,c,u,h=null,d=0,f=null;function m(x){let y=x.isScene===!0?x.background:null;return y&&y.isTexture&&(y=(x.backgroundBlurriness>0?t:e).get(y)),y}function _(x){let y=!1,E=m(x);E===null?p(o,l):E&&E.isColor&&(p(E,1),y=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(x,y){let E=m(y);E&&(E.isCubeTexture||E.mapping===to)?(u===void 0&&(u=new it(new ts(1,1,1),new St({name:"BackgroundCubeMaterial",uniforms:Ws(yi.backgroundCube.uniforms),vertexShader:yi.backgroundCube.vertexShader,fragmentShader:yi.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,I,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),js.copy(y.backgroundRotation),js.x*=-1,js.y*=-1,js.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(js.y*=-1,js.z*=-1),u.material.uniforms.envMap.value=E,u.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Xy.makeRotationFromEuler(js)),u.material.toneMapped=Qe.getTransfer(E.colorSpace)!==ht,(h!==E||d!==E.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=E,d=E.version,f=i.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new it(new Fi(2,2),new St({name:"BackgroundMaterial",uniforms:Ws(yi.background.uniforms),vertexShader:yi.background.vertexShader,fragmentShader:yi.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(E.colorSpace)!==ht,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(h!==E||d!==E.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=E,d=E.version,f=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,y){x.getRGB(Ac,Th(i)),n.buffers.color.setClear(Ac.r,Ac.g,Ac.b,y,a)}function b(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:_,addToRenderList:g,dispose:b}}function $y(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(M,P,L,N,z){let V=!1,B=h(N,L,P);r!==B&&(r=B,c(r.object)),V=f(M,N,L,z),V&&m(M,N,L,z),z!==null&&e.update(z,i.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,y(M,P,L,N),z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function l(){return i.createVertexArray()}function c(M){return i.bindVertexArray(M)}function u(M){return i.deleteVertexArray(M)}function h(M,P,L){let N=L.wireframe===!0,z=n[M.id];z===void 0&&(z={},n[M.id]=z);let V=z[P.id];V===void 0&&(V={},z[P.id]=V);let B=V[N];return B===void 0&&(B=d(l()),V[N]=B),B}function d(M){let P=[],L=[],N=[];for(let z=0;z<t;z++)P[z]=0,L[z]=0,N[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:L,attributeDivisors:N,object:M,attributes:{},index:null}}function f(M,P,L,N){let z=r.attributes,V=P.attributes,B=0,ie=L.getAttributes();for(let G in ie)if(ie[G].location>=0){let le=z[G],Me=V[G];if(Me===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(Me=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(Me=M.instanceColor)),le===void 0||le.attribute!==Me||Me&&le.data!==Me.data)return!0;B++}return r.attributesNum!==B||r.index!==N}function m(M,P,L,N){let z={},V=P.attributes,B=0,ie=L.getAttributes();for(let G in ie)if(ie[G].location>=0){let le=V[G];le===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(le=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(le=M.instanceColor));let Me={};Me.attribute=le,le&&le.data&&(Me.data=le.data),z[G]=Me,B++}r.attributes=z,r.attributesNum=B,r.index=N}function _(){let M=r.newAttributes;for(let P=0,L=M.length;P<L;P++)M[P]=0}function g(M){p(M,0)}function p(M,P){let L=r.newAttributes,N=r.enabledAttributes,z=r.attributeDivisors;L[M]=1,N[M]===0&&(i.enableVertexAttribArray(M),N[M]=1),z[M]!==P&&(i.vertexAttribDivisor(M,P),z[M]=P)}function b(){let M=r.newAttributes,P=r.enabledAttributes;for(let L=0,N=P.length;L<N;L++)P[L]!==M[L]&&(i.disableVertexAttribArray(L),P[L]=0)}function x(M,P,L,N,z,V,B){B===!0?i.vertexAttribIPointer(M,P,L,z,V):i.vertexAttribPointer(M,P,L,N,z,V)}function y(M,P,L,N){_();let z=N.attributes,V=L.getAttributes(),B=P.defaultAttributeValues;for(let ie in V){let G=V[ie];if(G.location>=0){let oe=z[ie];if(oe===void 0&&(ie==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),ie==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor)),oe!==void 0){let le=oe.normalized,Me=oe.itemSize,Ae=e.get(oe);if(Ae===void 0)continue;let Ne=Ae.buffer,Ve=Ae.type,fe=Ae.bytesPerElement,q=Ve===i.INT||Ve===i.UNSIGNED_INT||oe.gpuType===jl;if(oe.isInterleavedBufferAttribute){let Z=oe.data,me=Z.stride,we=oe.offset;if(Z.isInstancedInterleavedBuffer){for(let _e=0;_e<G.locationSize;_e++)p(G.location+_e,Z.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let _e=0;_e<G.locationSize;_e++)g(G.location+_e);i.bindBuffer(i.ARRAY_BUFFER,Ne);for(let _e=0;_e<G.locationSize;_e++)x(G.location+_e,Me/G.locationSize,Ve,le,me*fe,(we+Me/G.locationSize*_e)*fe,q)}else{if(oe.isInstancedBufferAttribute){for(let Z=0;Z<G.locationSize;Z++)p(G.location+Z,oe.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Z=0;Z<G.locationSize;Z++)g(G.location+Z);i.bindBuffer(i.ARRAY_BUFFER,Ne);for(let Z=0;Z<G.locationSize;Z++)x(G.location+Z,Me/G.locationSize,Ve,le,Me*fe,Me/G.locationSize*Z*fe,q)}}else if(B!==void 0){let le=B[ie];if(le!==void 0)switch(le.length){case 2:i.vertexAttrib2fv(G.location,le);break;case 3:i.vertexAttrib3fv(G.location,le);break;case 4:i.vertexAttrib4fv(G.location,le);break;default:i.vertexAttrib1fv(G.location,le)}}}}b()}function E(){R();for(let M in n){let P=n[M];for(let L in P){let N=P[L];for(let z in N)u(N[z].object),delete N[z];delete P[L]}delete n[M]}}function A(M){if(n[M.id]===void 0)return;let P=n[M.id];for(let L in P){let N=P[L];for(let z in N)u(N[z].object),delete N[z];delete P[L]}delete n[M.id]}function I(M){for(let P in n){let L=n[P];if(L[M.id]===void 0)continue;let N=L[M.id];for(let z in N)u(N[z].object),delete N[z];delete L[M.id]}}function R(){S(),a=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:R,resetDefaultState:S,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfProgram:I,initAttributes:_,enableAttribute:g,disableUnusedAttributes:b}}function Zy(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function a(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function o(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let m=0;m<h;m++)f+=u[m];t.update(f,n,1)}function l(c,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<c.length;m++)a(c[m],u[m],d[m]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let m=0;for(let _=0;_<h;_++)m+=u[_]*d[_];t.update(m,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Ky(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(I){return!(I!==_n&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){let R=I===Ut&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==Fn&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==ln&&!R)}function l(I){if(I==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),x=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=m>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:b,maxVaryings:x,maxFragmentUniforms:y,vertexTextures:E,maxSamples:A}}function Jy(i){let e=this,t=null,n=0,s=!1,r=!1,a=new an,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let m=h.clippingPlanes,_=h.clipIntersection,g=h.clipShadows,p=i.get(h);if(!s||m===null||m.length===0||r&&!g)r?u(null):c();else{let b=r?0:n,x=b*4,y=p.clippingState||null;l.value=y,y=u(m,d,x,f);for(let E=0;E!==x;++E)y[E]=t[E];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,m){let _=h!==null?h.length:0,g=null;if(_!==0){if(g=l.value,m!==!0||g===null){let p=f+_*4,b=d.matrixWorldInverse;o.getNormalMatrix(b),(g===null||g.length<p)&&(g=new Float32Array(p));for(let x=0,y=f;x!==_;++x,y+=4)a.copy(h[x]).applyMatrix4(b,o),a.normal.toArray(g,y),g[y+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}function Qy(i){let e=new WeakMap;function t(a,o){return o===Or?a.mapping=Hs:o===Gl&&(a.mapping=Vs),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Or||o===Gl)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new Sr(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Vr=4,kp=[.125,.215,.35,.446,.526,.582],Ys=20,Ih=new ki,Hp=new Ie,Dh=null,Lh=0,Uh=0,Nh=!1,Xs=(1+Math.sqrt(5))/2,Hr=1/Xs,Vp=[new C(-Xs,Hr,0),new C(Xs,Hr,0),new C(-Hr,0,Xs),new C(Hr,0,Xs),new C(0,Xs,-Hr),new C(0,Xs,Hr),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)],ex=new C,Wr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=ex}=r;Dh=this._renderer.getRenderTarget(),Lh=this._renderer.getActiveCubeFace(),Uh=this._renderer.getActiveMipmapLevel(),Nh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=jp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Wp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Dh,Lh,Uh),this._renderer.xr.enabled=Nh,e.scissorTest=!1,Rc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Hs||e.mapping===Vs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Dh=this._renderer.getRenderTarget(),Lh=this._renderer.getActiveCubeFace(),Uh=this._renderer.getActiveMipmapLevel(),Nh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Lt,minFilter:Lt,generateMipmaps:!1,type:Ut,format:_n,colorSpace:Ht,depthBuffer:!1},s=Gp(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gp(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=tx(r)),this._blurMaterial=nx(r,e,t)}return s}_compileMaterial(e){let t=new it(this._lodPlanes[0],e);this._renderer.compile(t,Ih)}_sceneToCubeUV(e,t,n,s,r){let l=new It(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Hp),h.toneMapping=Vi,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));let _=new Gt({name:"PMREM.Background",side:Jt,depthWrite:!1,depthTest:!1}),g=new it(new ts,_),p=!1,b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,p=!0):(_.color.copy(Hp),p=!0);for(let x=0;x<6;x++){let y=x%3;y===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[x],r.y,r.z)):y===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[x]));let E=this._cubeSize;Rc(s,y*E,x>2?E:0,E,E),h.setRenderTarget(s),p&&h.render(g,l),h.render(e,l)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=b}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Hs||e.mapping===Vs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=jp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Wp());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new it(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Rc(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Ih)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Vp[(s-r-1)%Vp.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new it(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Ys-1),_=r/m,g=isFinite(r)?1+Math.floor(u*_):Ys;g>Ys&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ys}`);let p=[],b=0;for(let I=0;I<Ys;++I){let R=I/_,S=Math.exp(-R*R/2);p.push(S),I===0?b+=S:I<g&&(b+=2*S)}for(let I=0;I<p.length;I++)p[I]=p[I]/b;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:x}=this;d.dTheta.value=m,d.mipInt.value=x-n;let y=this._sizeLods[s],E=3*y*(s>x-Vr?s-x+Vr:0),A=4*(this._cubeSize-y);Rc(t,E,A,3*y,2*y),l.setRenderTarget(t),l.render(h,Ih)}};function tx(i){let e=[],t=[],n=[],s=i,r=i-Vr+1+kp.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Vr?l=kp[a-i+Vr-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,m=6,_=3,g=2,p=1,b=new Float32Array(_*m*f),x=new Float32Array(g*m*f),y=new Float32Array(p*m*f);for(let A=0;A<f;A++){let I=A%3*2/3-1,R=A>2?0:-1,S=[I,R,0,I+2/3,R,0,I+2/3,R+1,0,I,R,0,I+2/3,R+1,0,I,R+1,0];b.set(S,_*m*A),x.set(d,g*m*A);let M=[A,A,A,A,A,A];y.set(M,p*m*A)}let E=new gt;E.setAttribute("position",new ut(b,_)),E.setAttribute("uv",new ut(x,g)),E.setAttribute("faceIndex",new ut(y,p)),e.push(E),s>Vr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Gp(i,e,t){let n=new Vt(i,e,t);return n.texture.mapping=to,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Rc(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function nx(i,e,t){let n=new Float32Array(Ys),s=new C(0,1,0);return new St({name:"SphericalGaussianBlur",defines:{n:Ys,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:jh(),fragmentShader:`

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
    `,blending:zt,depthTest:!1,depthWrite:!1})}function Wp(){return new St({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:jh(),fragmentShader:`

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
    `,blending:zt,depthTest:!1,depthWrite:!1})}function jp(){return new St({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jh(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      uniform float flipEnvMap;

      varying vec3 vOutputDirection;

      uniform samplerCube envMap;

      void main() {

        gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

      }
    `,blending:zt,depthTest:!1,depthWrite:!1})}function jh(){return`

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
  `}function ix(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===Or||l===Gl,u=l===Hs||l===Vs;if(c||u){let h=e.get(o),d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Wr(i)),h=c?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{let f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new Wr(i)),h=c?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",r),h.texture):null}}}return o}function s(o){let l=0,c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function sx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&xr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function rx(i,e,t,n){let s={},r=new WeakMap;function a(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(h){let d=[],f=h.index,m=h.attributes.position,_=0;if(f!==null){let b=f.array;_=f.version;for(let x=0,y=b.length;x<y;x+=3){let E=b[x+0],A=b[x+1],I=b[x+2];d.push(E,A,A,I,I,E)}}else if(m!==void 0){let b=m.array;_=m.version;for(let x=0,y=b.length/3-1;x<y;x+=3){let E=x+0,A=x+1,I=x+2;d.push(E,A,A,I,I,E)}}else return;let g=new(Eh(d)?xa:ya)(d,1);g.version=_;let p=r.get(h);p&&e.remove(p),r.set(h,g)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function ax(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*a),t.update(f,n,1)}function c(d,f,m){m!==0&&(i.drawElementsInstanced(n,f,r,d*a,m),t.update(f,n,m))}function u(d,f,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,m);let g=0;for(let p=0;p<m;p++)g+=f[p];t.update(g,n,1)}function h(d,f,m,_){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,m);let p=0;for(let b=0;b<m;b++)p+=f[b]*_[b];t.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ox(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function lx(i,e,t){let n=new WeakMap,s=new st;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,d=n.get(o);if(d===void 0||d.count!==h){let S=function(){I.dispose(),n.delete(o),o.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],b=o.morphAttributes.color||[],x=0;f===!0&&(x=1),m===!0&&(x=2),_===!0&&(x=3);let y=o.attributes.position.count*x,E=1;y>e.maxTextureSize&&(E=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let A=new Float32Array(y*E*4*h),I=new _a(A,y,E,h);I.type=ln,I.needsUpdate=!0;let R=x*4;for(let M=0;M<h;M++){let P=g[M],L=p[M],N=b[M],z=y*E*4*M;for(let V=0;V<P.count;V++){let B=V*R;f===!0&&(s.fromBufferAttribute(P,V),A[z+B+0]=s.x,A[z+B+1]=s.y,A[z+B+2]=s.z,A[z+B+3]=0),m===!0&&(s.fromBufferAttribute(L,V),A[z+B+4]=s.x,A[z+B+5]=s.y,A[z+B+6]=s.z,A[z+B+7]=0),_===!0&&(s.fromBufferAttribute(N,V),A[z+B+8]=s.x,A[z+B+9]=s.y,A[z+B+10]=s.z,A[z+B+11]=N.itemSize===4?s.w:1)}}d={count:h,texture:I,size:new ce(y,E)},n.set(o,d),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",m),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function cx(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}var um=new $t,qp=new Is(1,1),hm=new _a,dm=new fl,fm=new ba,Xp=[],Yp=[],$p=new Float32Array(16),Zp=new Float32Array(9),Kp=new Float32Array(4);function jr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Xp[s];if(r===void 0&&(r=new Float32Array(s),Xp[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function jt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function qt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ic(i,e){let t=Yp[e];t===void 0&&(t=new Int32Array(e),Yp[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ux(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function hx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2fv(this.addr,e),qt(t,e)}}function dx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(jt(t,e))return;i.uniform3fv(this.addr,e),qt(t,e)}}function fx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4fv(this.addr,e),qt(t,e)}}function px(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;Kp.set(n),i.uniformMatrix2fv(this.addr,!1,Kp),qt(t,n)}}function mx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;Zp.set(n),i.uniformMatrix3fv(this.addr,!1,Zp),qt(t,n)}}function gx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(jt(t,n))return;$p.set(n),i.uniformMatrix4fv(this.addr,!1,$p),qt(t,n)}}function _x(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function yx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2iv(this.addr,e),qt(t,e)}}function xx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;i.uniform3iv(this.addr,e),qt(t,e)}}function vx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4iv(this.addr,e),qt(t,e)}}function bx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Mx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;i.uniform2uiv(this.addr,e),qt(t,e)}}function Sx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;i.uniform3uiv(this.addr,e),qt(t,e)}}function wx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;i.uniform4uiv(this.addr,e),qt(t,e)}}function Ex(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(qp.compareFunction=bh,r=qp):r=um,t.setTexture2D(e||r,s)}function Tx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||dm,s)}function Ax(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||fm,s)}function Rx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||hm,s)}function Cx(i){switch(i){case 5126:return ux;case 35664:return hx;case 35665:return dx;case 35666:return fx;case 35674:return px;case 35675:return mx;case 35676:return gx;case 5124:case 35670:return _x;case 35667:case 35671:return yx;case 35668:case 35672:return xx;case 35669:case 35673:return vx;case 5125:return bx;case 36294:return Mx;case 36295:return Sx;case 36296:return wx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ex;case 35679:case 36299:case 36307:return Tx;case 35680:case 36300:case 36308:case 36293:return Ax;case 36289:case 36303:case 36311:case 36292:return Rx}}function Px(i,e){i.uniform1fv(this.addr,e)}function Ix(i,e){let t=jr(e,this.size,2);i.uniform2fv(this.addr,t)}function Dx(i,e){let t=jr(e,this.size,3);i.uniform3fv(this.addr,t)}function Lx(i,e){let t=jr(e,this.size,4);i.uniform4fv(this.addr,t)}function Ux(i,e){let t=jr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Nx(i,e){let t=jr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Fx(i,e){let t=jr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ox(i,e){i.uniform1iv(this.addr,e)}function zx(i,e){i.uniform2iv(this.addr,e)}function Bx(i,e){i.uniform3iv(this.addr,e)}function kx(i,e){i.uniform4iv(this.addr,e)}function Hx(i,e){i.uniform1uiv(this.addr,e)}function Vx(i,e){i.uniform2uiv(this.addr,e)}function Gx(i,e){i.uniform3uiv(this.addr,e)}function Wx(i,e){i.uniform4uiv(this.addr,e)}function jx(i,e,t){let n=this.cache,s=e.length,r=Ic(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||um,r[a])}function qx(i,e,t){let n=this.cache,s=e.length,r=Ic(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||dm,r[a])}function Xx(i,e,t){let n=this.cache,s=e.length,r=Ic(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||fm,r[a])}function Yx(i,e,t){let n=this.cache,s=e.length,r=Ic(t,s);jt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||hm,r[a])}function $x(i){switch(i){case 5126:return Px;case 35664:return Ix;case 35665:return Dx;case 35666:return Lx;case 35674:return Ux;case 35675:return Nx;case 35676:return Fx;case 5124:case 35670:return Ox;case 35667:case 35671:return zx;case 35668:case 35672:return Bx;case 35669:case 35673:return kx;case 5125:return Hx;case 36294:return Vx;case 36295:return Gx;case 36296:return Wx;case 35678:case 36198:case 36298:case 36306:case 35682:return jx;case 35679:case 36299:case 36307:return qx;case 35680:case 36300:case 36308:case 36293:return Xx;case 36289:case 36303:case 36311:case 36292:return Yx}}var Oh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Cx(t.type)}},zh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$x(t.type)}},Bh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Fh=/(\w+)(\])?(\[|\.)?/g;function Jp(i,e){i.seq.push(e),i.map[e.id]=e}function Zx(i,e,t){let n=i.name,s=n.length;for(Fh.lastIndex=0;;){let r=Fh.exec(n),a=Fh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Jp(t,c===void 0?new Oh(o,i,e):new zh(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new Bh(o),Jp(t,h)),t=h}}}var Gr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);Zx(r,a,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Qp(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Kx=37297,Jx=0;function Qx(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var em=new Ye;function ev(i){Qe._getMatrix(em,Qe.workingColorSpace,i);let e=`mat3( ${em.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(i)){case ma:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function tm(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Qx(i.getShaderSource(e),o)}else return r}function tv(i,e){let t=ev(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function nv(i,e){let t;switch(e){case Ol:t="Linear";break;case zl:t="Reinhard";break;case Bl:t="Cineon";break;case Fr:t="ACESFilmic";break;case Hl:t="AgX";break;case Vl:t="Neutral";break;case kl:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Cc=new C;function iv(){Qe.getLuminanceCoefficients(Cc);let i=Cc.x.toFixed(4),e=Cc.y.toFixed(4),t=Cc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(oo).join(`
`)}function rv(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function av(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function oo(i){return i!==""}function nm(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function im(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ov=/^[ \t]*#include +<([\w\d./]+)>/gm;function kh(i){return i.replace(ov,cv)}var lv=new Map;function cv(i,e){let t=qe[e];if(t===void 0){let n=lv.get(e);if(n!==void 0)t=qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return kh(t)}var uv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sm(i){return i.replace(uv,hv)}function hv(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function rm(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function dv(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Ja?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===np?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===_i&&(e="SHADOWMAP_TYPE_VSM"),e}function fv(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Hs:case Vs:e="ENVMAP_TYPE_CUBE";break;case to:e="ENVMAP_TYPE_CUBE_UV";break}return e}function pv(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Vs:e="ENVMAP_MODE_REFRACTION";break}return e}function mv(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case hh:e="ENVMAP_BLENDING_MULTIPLY";break;case _p:e="ENVMAP_BLENDING_MIX";break;case yp:e="ENVMAP_BLENDING_ADD";break}return e}function gv(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function _v(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=dv(t),c=fv(t),u=pv(t),h=mv(t),d=gv(t),f=sv(t),m=rv(r),_=s.createProgram(),g,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(oo).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(oo).join(`
`),p.length>0&&(p+=`
`)):(g=[rm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(oo).join(`
`),p=[rm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Vi?"#define TONE_MAPPING":"",t.toneMapping!==Vi?qe.tonemapping_pars_fragment:"",t.toneMapping!==Vi?nv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,tv("linearToOutputTexel",t.outputColorSpace),iv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(oo).join(`
`)),a=kh(a),a=nm(a,t),a=im(a,t),o=kh(o),o=nm(o,t),o=im(o,t),a=sm(a),o=sm(o),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Sh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Sh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let x=b+g+a,y=b+p+o,E=Qp(s,s.VERTEX_SHADER,x),A=Qp(s,s.FRAGMENT_SHADER,y);s.attachShader(_,E),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function I(P){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(_)||"",N=s.getShaderInfoLog(E)||"",z=s.getShaderInfoLog(A)||"",V=L.trim(),B=N.trim(),ie=z.trim(),G=!0,oe=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,E,A);else{let le=tm(s,E,"vertex"),Me=tm(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+V+`
`+le+`
`+Me)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(B===""||ie==="")&&(oe=!1);oe&&(P.diagnostics={runnable:G,programLog:V,vertexShader:{log:B,prefix:g},fragmentShader:{log:ie,prefix:p}})}s.deleteShader(E),s.deleteShader(A),R=new Gr(s,_),S=av(s,_)}let R;this.getUniforms=function(){return R===void 0&&I(this),R};let S;this.getAttributes=function(){return S===void 0&&I(this),S};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(_,Kx)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jx++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=E,this.fragmentShader=A,this}var yv=0,Hh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Vh(e),t.set(e,n)),n}},Vh=class{constructor(e){this.id=yv++,this.code=e,this.usedTimes=0}};function xv(i,e,t,n,s,r,a){let o=new br,l=new Hh,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function g(S,M,P,L,N){let z=L.fog,V=N.geometry,B=S.isMeshStandardMaterial?L.environment:null,ie=(S.isMeshStandardMaterial?t:e).get(S.envMap||B),G=ie&&ie.mapping===to?ie.image.height:null,oe=m[S.type];S.precision!==null&&(f=s.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));let le=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Me=le!==void 0?le.length:0,Ae=0;V.morphAttributes.position!==void 0&&(Ae=1),V.morphAttributes.normal!==void 0&&(Ae=2),V.morphAttributes.color!==void 0&&(Ae=3);let Ne,Ve,fe,q;if(oe){let et=yi[oe];Ne=et.vertexShader,Ve=et.fragmentShader}else Ne=S.vertexShader,Ve=S.fragmentShader,l.update(S),fe=l.getVertexShaderID(S),q=l.getFragmentShaderID(S);let Z=i.getRenderTarget(),me=i.state.buffers.depth.getReversed(),we=N.isInstancedMesh===!0,_e=N.isBatchedMesh===!0,Oe=!!S.map,dt=!!S.matcap,U=!!ie,lt=!!S.aoMap,ze=!!S.lightMap,Y=!!S.bumpMap,re=!!S.normalMap,Be=!!S.displacementMap,he=!!S.emissiveMap,Pe=!!S.metalnessMap,$e=!!S.roughnessMap,Je=S.anisotropy>0,D=S.clearcoat>0,v=S.dispersion>0,F=S.iridescence>0,J=S.sheen>0,te=S.transmission>0,W=Je&&!!S.anisotropyMap,ge=D&&!!S.clearcoatMap,ae=D&&!!S.clearcoatNormalMap,xe=D&&!!S.clearcoatRoughnessMap,ye=F&&!!S.iridescenceMap,se=F&&!!S.iridescenceThicknessMap,pe=J&&!!S.sheenColorMap,Le=J&&!!S.sheenRoughnessMap,Ee=!!S.specularMap,de=!!S.specularColorMap,Ue=!!S.specularIntensityMap,w=te&&!!S.transmissionMap,O=te&&!!S.thicknessMap,j=!!S.gradientMap,ee=!!S.alphaMap,ne=S.alphaTest>0,X=!!S.alphaHash,be=!!S.extensions,De=Vi;S.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(De=i.toneMapping);let ot={shaderID:oe,shaderType:S.type,shaderName:S.name,vertexShader:Ne,fragmentShader:Ve,defines:S.defines,customVertexShaderID:fe,customFragmentShaderID:q,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:_e,batchingColor:_e&&N._colorsTexture!==null,instancing:we,instancingColor:we&&N.instanceColor!==null,instancingMorph:we&&N.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Z===null?i.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:Ht,alphaToCoverage:!!S.alphaToCoverage,map:Oe,matcap:dt,envMap:U,envMapMode:U&&ie.mapping,envMapCubeUVHeight:G,aoMap:lt,lightMap:ze,bumpMap:Y,normalMap:re,displacementMap:d&&Be,emissiveMap:he,normalMapObjectSpace:re&&S.normalMapType===Sp,normalMapTangentSpace:re&&S.normalMapType===Tc,metalnessMap:Pe,roughnessMap:$e,anisotropy:Je,anisotropyMap:W,clearcoat:D,clearcoatMap:ge,clearcoatNormalMap:ae,clearcoatRoughnessMap:xe,dispersion:v,iridescence:F,iridescenceMap:ye,iridescenceThicknessMap:se,sheen:J,sheenColorMap:pe,sheenRoughnessMap:Le,specularMap:Ee,specularColorMap:de,specularIntensityMap:Ue,transmission:te,transmissionMap:w,thicknessMap:O,gradientMap:j,opaque:S.transparent===!1&&S.blending===ws&&S.alphaToCoverage===!1,alphaMap:ee,alphaTest:ne,alphaHash:X,combine:S.combine,mapUv:Oe&&_(S.map.channel),aoMapUv:lt&&_(S.aoMap.channel),lightMapUv:ze&&_(S.lightMap.channel),bumpMapUv:Y&&_(S.bumpMap.channel),normalMapUv:re&&_(S.normalMap.channel),displacementMapUv:Be&&_(S.displacementMap.channel),emissiveMapUv:he&&_(S.emissiveMap.channel),metalnessMapUv:Pe&&_(S.metalnessMap.channel),roughnessMapUv:$e&&_(S.roughnessMap.channel),anisotropyMapUv:W&&_(S.anisotropyMap.channel),clearcoatMapUv:ge&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:ae&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:se&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:pe&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Le&&_(S.sheenRoughnessMap.channel),specularMapUv:Ee&&_(S.specularMap.channel),specularColorMapUv:de&&_(S.specularColorMap.channel),specularIntensityMapUv:Ue&&_(S.specularIntensityMap.channel),transmissionMapUv:w&&_(S.transmissionMap.channel),thicknessMapUv:O&&_(S.thicknessMap.channel),alphaMapUv:ee&&_(S.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(re||Je),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!V.attributes.uv&&(Oe||ee),fog:!!z,useFog:S.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:me,skinning:N.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Ae,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:De,decodeVideoTexture:Oe&&S.map.isVideoTexture===!0&&Qe.getTransfer(S.map.colorSpace)===ht,decodeVideoTextureEmissive:he&&S.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(S.emissiveMap.colorSpace)===ht,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Mn,flipSided:S.side===Jt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:be&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&S.extensions.multiDraw===!0||_e)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot}function p(S){let M=[];if(S.shaderID?M.push(S.shaderID):(M.push(S.customVertexShaderID),M.push(S.customFragmentShaderID)),S.defines!==void 0)for(let P in S.defines)M.push(P),M.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(b(M,S),x(M,S),M.push(i.outputColorSpace)),M.push(S.customProgramCacheKey),M.join()}function b(S,M){S.push(M.precision),S.push(M.outputColorSpace),S.push(M.envMapMode),S.push(M.envMapCubeUVHeight),S.push(M.mapUv),S.push(M.alphaMapUv),S.push(M.lightMapUv),S.push(M.aoMapUv),S.push(M.bumpMapUv),S.push(M.normalMapUv),S.push(M.displacementMapUv),S.push(M.emissiveMapUv),S.push(M.metalnessMapUv),S.push(M.roughnessMapUv),S.push(M.anisotropyMapUv),S.push(M.clearcoatMapUv),S.push(M.clearcoatNormalMapUv),S.push(M.clearcoatRoughnessMapUv),S.push(M.iridescenceMapUv),S.push(M.iridescenceThicknessMapUv),S.push(M.sheenColorMapUv),S.push(M.sheenRoughnessMapUv),S.push(M.specularMapUv),S.push(M.specularColorMapUv),S.push(M.specularIntensityMapUv),S.push(M.transmissionMapUv),S.push(M.thicknessMapUv),S.push(M.combine),S.push(M.fogExp2),S.push(M.sizeAttenuation),S.push(M.morphTargetsCount),S.push(M.morphAttributeCount),S.push(M.numDirLights),S.push(M.numPointLights),S.push(M.numSpotLights),S.push(M.numSpotLightMaps),S.push(M.numHemiLights),S.push(M.numRectAreaLights),S.push(M.numDirLightShadows),S.push(M.numPointLightShadows),S.push(M.numSpotLightShadows),S.push(M.numSpotLightShadowsWithMaps),S.push(M.numLightProbes),S.push(M.shadowMapType),S.push(M.toneMapping),S.push(M.numClippingPlanes),S.push(M.numClipIntersection),S.push(M.depthPacking)}function x(S,M){o.disableAll(),M.supportsVertexTextures&&o.enable(0),M.instancing&&o.enable(1),M.instancingColor&&o.enable(2),M.instancingMorph&&o.enable(3),M.matcap&&o.enable(4),M.envMap&&o.enable(5),M.normalMapObjectSpace&&o.enable(6),M.normalMapTangentSpace&&o.enable(7),M.clearcoat&&o.enable(8),M.iridescence&&o.enable(9),M.alphaTest&&o.enable(10),M.vertexColors&&o.enable(11),M.vertexAlphas&&o.enable(12),M.vertexUv1s&&o.enable(13),M.vertexUv2s&&o.enable(14),M.vertexUv3s&&o.enable(15),M.vertexTangents&&o.enable(16),M.anisotropy&&o.enable(17),M.alphaHash&&o.enable(18),M.batching&&o.enable(19),M.dispersion&&o.enable(20),M.batchingColor&&o.enable(21),M.gradientMap&&o.enable(22),S.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reversedDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.decodeVideoTextureEmissive&&o.enable(20),M.alphaToCoverage&&o.enable(21),S.push(o.mask)}function y(S){let M=m[S.type],P;if(M){let L=yi[M];P=un.clone(L.uniforms)}else P=S.uniforms;return P}function E(S,M){let P;for(let L=0,N=u.length;L<N;L++){let z=u[L];if(z.cacheKey===M){P=z,++P.usedTimes;break}}return P===void 0&&(P=new _v(i,M,S,r),u.push(P)),P}function A(S){if(--S.usedTimes===0){let M=u.indexOf(S);u[M]=u[u.length-1],u.pop(),S.destroy()}}function I(S){l.remove(S)}function R(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:y,acquireProgram:E,releaseProgram:A,releaseShaderCache:I,programs:u,dispose:R}}function vv(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function bv(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function am(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function om(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h,d,f,m,_,g){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:m,renderOrder:h.renderOrder,z:_,group:g},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=m,p.renderOrder=h.renderOrder,p.z=_,p.group=g),e++,p}function o(h,d,f,m,_,g){let p=a(h,d,f,m,_,g);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,m,_,g){let p=a(h,d,f,m,_,g);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||bv),n.length>1&&n.sort(d||am),s.length>1&&s.sort(d||am)}function u(){for(let h=e,d=i.length;h<d;h++){let f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function Mv(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new om,i.set(n,[a])):s>=r.length?(a=new om,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Sv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new Ie};break;case"SpotLight":t={position:new C,direction:new C,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function wv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Ev=0;function Tv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Av(i){let e=new Sv,t=wv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);let s=new C,r=new Re,a=new Re;function o(c){let u=0,h=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,m=0,_=0,g=0,p=0,b=0,x=0,y=0,E=0,A=0,I=0;c.sort(Tv);for(let S=0,M=c.length;S<M;S++){let P=c[S],L=P.color,N=P.intensity,z=P.distance,V=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=L.r*N,h+=L.g*N,d+=L.b*N;else if(P.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(P.sh.coefficients[B],N);I++}else if(P.isDirectionalLight){let B=e.get(P);if(B.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let ie=P.shadow,G=t.get(P);G.shadowIntensity=ie.intensity,G.shadowBias=ie.bias,G.shadowNormalBias=ie.normalBias,G.shadowRadius=ie.radius,G.shadowMapSize=ie.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=V,n.directionalShadowMatrix[f]=P.shadow.matrix,b++}n.directional[f]=B,f++}else if(P.isSpotLight){let B=e.get(P);B.position.setFromMatrixPosition(P.matrixWorld),B.color.copy(L).multiplyScalar(N),B.distance=z,B.coneCos=Math.cos(P.angle),B.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),B.decay=P.decay,n.spot[_]=B;let ie=P.shadow;if(P.map&&(n.spotLightMap[E]=P.map,E++,ie.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[_]=ie.matrix,P.castShadow){let G=t.get(P);G.shadowIntensity=ie.intensity,G.shadowBias=ie.bias,G.shadowNormalBias=ie.normalBias,G.shadowRadius=ie.radius,G.shadowMapSize=ie.mapSize,n.spotShadow[_]=G,n.spotShadowMap[_]=V,y++}_++}else if(P.isRectAreaLight){let B=e.get(P);B.color.copy(L).multiplyScalar(N),B.halfWidth.set(P.width*.5,0,0),B.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=B,g++}else if(P.isPointLight){let B=e.get(P);if(B.color.copy(P.color).multiplyScalar(P.intensity),B.distance=P.distance,B.decay=P.decay,P.castShadow){let ie=P.shadow,G=t.get(P);G.shadowIntensity=ie.intensity,G.shadowBias=ie.bias,G.shadowNormalBias=ie.normalBias,G.shadowRadius=ie.radius,G.shadowMapSize=ie.mapSize,G.shadowCameraNear=ie.camera.near,G.shadowCameraFar=ie.camera.far,n.pointShadow[m]=G,n.pointShadowMap[m]=V,n.pointShadowMatrix[m]=P.shadow.matrix,x++}n.point[m]=B,m++}else if(P.isHemisphereLight){let B=e.get(P);B.skyColor.copy(P.color).multiplyScalar(N),B.groundColor.copy(P.groundColor).multiplyScalar(N),n.hemi[p]=B,p++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;let R=n.hash;(R.directionalLength!==f||R.pointLength!==m||R.spotLength!==_||R.rectAreaLength!==g||R.hemiLength!==p||R.numDirectionalShadows!==b||R.numPointShadows!==x||R.numSpotShadows!==y||R.numSpotMaps!==E||R.numLightProbes!==I)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=y+E-A,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=I,R.directionalLength=f,R.pointLength=m,R.spotLength=_,R.rectAreaLength=g,R.hemiLength=p,R.numDirectionalShadows=b,R.numPointShadows=x,R.numSpotShadows=y,R.numSpotMaps=E,R.numLightProbes=I,n.version=Ev++)}function l(c,u){let h=0,d=0,f=0,m=0,_=0,g=u.matrixWorldInverse;for(let p=0,b=c.length;p<b;p++){let x=c[p];if(x.isDirectionalLight){let y=n.directional[h];y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(g),h++}else if(x.isSpotLight){let y=n.spot[f];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(g),f++}else if(x.isRectAreaLight){let y=n.rectArea[m];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),a.identity(),r.copy(x.matrixWorld),r.premultiply(g),a.extractRotation(r),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),m++}else if(x.isPointLight){let y=n.point[d];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),d++}else if(x.isHemisphereLight){let y=n.hemi[_];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(g),_++}}}return{setup:o,setupView:l,state:n}}function lm(i){let e=new Av(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Rv(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new lm(i),e.set(s,[o])):r>=a.length?(o=new lm(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Cv=`void main() {
  gl_Position = vec4( position, 1.0 );
}`,Pv=`uniform sampler2D shadow_pass;
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
}`;function Iv(i,e,t){let n=new is,s=new ce,r=new ce,a=new st,o=new vl({depthPacking:Mp}),l=new bl,c={},u=t.maxTextureSize,h={[ni]:Jt,[Jt]:ni,[Mn]:Mn},d=new St({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:Cv,fragmentShader:Pv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new gt;m.setAttribute("position",new ut(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new it(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ja;let p=this.type;this.render=function(A,I,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||A.length===0)return;let S=i.getRenderTarget(),M=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),L=i.state;L.setBlending(zt),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let N=p!==_i&&this.type===_i,z=p===_i&&this.type!==_i;for(let V=0,B=A.length;V<B;V++){let ie=A[V],G=ie.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",ie,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let oe=G.getFrameExtents();if(s.multiply(oe),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/oe.x),s.x=r.x*oe.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/oe.y),s.y=r.y*oe.y,G.mapSize.y=r.y)),G.map===null||N===!0||z===!0){let Me=this.type!==_i?{minFilter:Ft,magFilter:Ft}:{};G.map!==null&&G.map.dispose(),G.map=new Vt(s.x,s.y,Me),G.map.texture.name=ie.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let le=G.getViewportCount();for(let Me=0;Me<le;Me++){let Ae=G.getViewport(Me);a.set(r.x*Ae.x,r.y*Ae.y,r.x*Ae.z,r.y*Ae.w),L.viewport(a),G.updateMatrices(ie,Me),n=G.getFrustum(),y(I,R,G.camera,ie,this.type)}G.isPointLightShadow!==!0&&this.type===_i&&b(G,R),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,i.setRenderTarget(S,M,P)};function b(A,I){let R=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Vt(s.x,s.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(I,null,R,d,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(I,null,R,f,_,null)}function x(A,I,R,S){let M=null,P=R.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)M=P;else if(M=R.isPointLight===!0?l:o,i.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let L=M.uuid,N=I.uuid,z=c[L];z===void 0&&(z={},c[L]=z);let V=z[N];V===void 0&&(V=M.clone(),z[N]=V,I.addEventListener("dispose",E)),M=V}if(M.visible=I.visible,M.wireframe=I.wireframe,S===_i?M.side=I.shadowSide!==null?I.shadowSide:I.side:M.side=I.shadowSide!==null?I.shadowSide:h[I.side],M.alphaMap=I.alphaMap,M.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,M.map=I.map,M.clipShadows=I.clipShadows,M.clippingPlanes=I.clippingPlanes,M.clipIntersection=I.clipIntersection,M.displacementMap=I.displacementMap,M.displacementScale=I.displacementScale,M.displacementBias=I.displacementBias,M.wireframeLinewidth=I.wireframeLinewidth,M.linewidth=I.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let L=i.properties.get(M);L.light=R}return M}function y(A,I,R,S,M){if(A.visible===!1)return;if(A.layers.test(I.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&M===_i)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,A.matrixWorld);let N=e.update(A),z=A.material;if(Array.isArray(z)){let V=N.groups;for(let B=0,ie=V.length;B<ie;B++){let G=V[B],oe=z[G.materialIndex];if(oe&&oe.visible){let le=x(A,oe,S,M);A.onBeforeShadow(i,A,I,R,N,le,G),i.renderBufferDirect(R,null,N,le,A,G),A.onAfterShadow(i,A,I,R,N,le,G)}}}else if(z.visible){let V=x(A,z,S,M);A.onBeforeShadow(i,A,I,R,N,V,null),i.renderBufferDirect(R,null,N,V,A,null),A.onAfterShadow(i,A,I,R,N,V,null)}}let L=A.children;for(let N=0,z=L.length;N<z;N++)y(L[N],I,R,S,M)}function E(A){A.target.removeEventListener("dispose",E);for(let R in c){let S=c[R],M=A.target.uuid;M in S&&(S[M].dispose(),delete S[M])}}}var Dv={[Pl]:Il,[Dl]:Nl,[Ll]:Fl,[Es]:Ul,[Il]:Pl,[Nl]:Dl,[Fl]:Ll,[Ul]:Es};function Lv(i,e){function t(){let w=!1,O=new st,j=null,ee=new st(0,0,0,0);return{setMask:function(ne){j!==ne&&!w&&(i.colorMask(ne,ne,ne,ne),j=ne)},setLocked:function(ne){w=ne},setClear:function(ne,X,be,De,ot){ot===!0&&(ne*=De,X*=De,be*=De),O.set(ne,X,be,De),ee.equals(O)===!1&&(i.clearColor(ne,X,be,De),ee.copy(O))},reset:function(){w=!1,j=null,ee.set(-1,0,0,0)}}}function n(){let w=!1,O=!1,j=null,ee=null,ne=null;return{setReversed:function(X){if(O!==X){let be=e.get("EXT_clip_control");X?be.clipControlEXT(be.LOWER_LEFT_EXT,be.ZERO_TO_ONE_EXT):be.clipControlEXT(be.LOWER_LEFT_EXT,be.NEGATIVE_ONE_TO_ONE_EXT),O=X;let De=ne;ne=null,this.setClear(De)}},getReversed:function(){return O},setTest:function(X){X?Z(i.DEPTH_TEST):me(i.DEPTH_TEST)},setMask:function(X){j!==X&&!w&&(i.depthMask(X),j=X)},setFunc:function(X){if(O&&(X=Dv[X]),ee!==X){switch(X){case Pl:i.depthFunc(i.NEVER);break;case Il:i.depthFunc(i.ALWAYS);break;case Dl:i.depthFunc(i.LESS);break;case Es:i.depthFunc(i.LEQUAL);break;case Ll:i.depthFunc(i.EQUAL);break;case Ul:i.depthFunc(i.GEQUAL);break;case Nl:i.depthFunc(i.GREATER);break;case Fl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ee=X}},setLocked:function(X){w=X},setClear:function(X){ne!==X&&(O&&(X=1-X),i.clearDepth(X),ne=X)},reset:function(){w=!1,j=null,ee=null,ne=null,O=!1}}}function s(){let w=!1,O=null,j=null,ee=null,ne=null,X=null,be=null,De=null,ot=null;return{setTest:function(et){w||(et?Z(i.STENCIL_TEST):me(i.STENCIL_TEST))},setMask:function(et){O!==et&&!w&&(i.stencilMask(et),O=et)},setFunc:function(et,dn,An){(j!==et||ee!==dn||ne!==An)&&(i.stencilFunc(et,dn,An),j=et,ee=dn,ne=An)},setOp:function(et,dn,An){(X!==et||be!==dn||De!==An)&&(i.stencilOp(et,dn,An),X=et,be=dn,De=An)},setLocked:function(et){w=et},setClear:function(et){ot!==et&&(i.clearStencil(et),ot=et)},reset:function(){w=!1,O=null,j=null,ee=null,ne=null,X=null,be=null,De=null,ot=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},h={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,b=null,x=null,y=null,E=null,A=null,I=new Ie(0,0,0),R=0,S=!1,M=null,P=null,L=null,N=null,z=null,V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),B=!1,ie=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(G)[1]),B=ie>=1):G.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),B=ie>=2);let oe=null,le={},Me=i.getParameter(i.SCISSOR_BOX),Ae=i.getParameter(i.VIEWPORT),Ne=new st().fromArray(Me),Ve=new st().fromArray(Ae);function fe(w,O,j,ee){let ne=new Uint8Array(4),X=i.createTexture();i.bindTexture(w,X),i.texParameteri(w,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(w,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let be=0;be<j;be++)w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY?i.texImage3D(O,0,i.RGBA,1,1,ee,0,i.RGBA,i.UNSIGNED_BYTE,ne):i.texImage2D(O+be,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ne);return X}let q={};q[i.TEXTURE_2D]=fe(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Z(i.DEPTH_TEST),a.setFunc(Es),Y(!1),re(oh),Z(i.CULL_FACE),lt(zt);function Z(w){u[w]!==!0&&(i.enable(w),u[w]=!0)}function me(w){u[w]!==!1&&(i.disable(w),u[w]=!1)}function we(w,O){return h[w]!==O?(i.bindFramebuffer(w,O),h[w]=O,w===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=O),w===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=O),!0):!1}function _e(w,O){let j=f,ee=!1;if(w){j=d.get(O),j===void 0&&(j=[],d.set(O,j));let ne=w.textures;if(j.length!==ne.length||j[0]!==i.COLOR_ATTACHMENT0){for(let X=0,be=ne.length;X<be;X++)j[X]=i.COLOR_ATTACHMENT0+X;j.length=ne.length,ee=!0}}else j[0]!==i.BACK&&(j[0]=i.BACK,ee=!0);ee&&i.drawBuffers(j)}function Oe(w){return m!==w?(i.useProgram(w),m=w,!0):!1}let dt={[Dn]:i.FUNC_ADD,[ip]:i.FUNC_SUBTRACT,[sp]:i.FUNC_REVERSE_SUBTRACT};dt[rp]=i.MIN,dt[ap]=i.MAX;let U={[ks]:i.ZERO,[op]:i.ONE,[lp]:i.SRC_COLOR,[ll]:i.SRC_ALPHA,[dp]:i.SRC_ALPHA_SATURATE,[eo]:i.DST_COLOR,[Qa]:i.DST_ALPHA,[cp]:i.ONE_MINUS_SRC_COLOR,[cl]:i.ONE_MINUS_SRC_ALPHA,[hp]:i.ONE_MINUS_DST_COLOR,[up]:i.ONE_MINUS_DST_ALPHA,[fp]:i.CONSTANT_COLOR,[pp]:i.ONE_MINUS_CONSTANT_COLOR,[mp]:i.CONSTANT_ALPHA,[gp]:i.ONE_MINUS_CONSTANT_ALPHA};function lt(w,O,j,ee,ne,X,be,De,ot,et){if(w===zt){_===!0&&(me(i.BLEND),_=!1);return}if(_===!1&&(Z(i.BLEND),_=!0),w!==Cl){if(w!==g||et!==S){if((p!==Dn||y!==Dn)&&(i.blendEquation(i.FUNC_ADD),p=Dn,y=Dn),et)switch(w){case ws:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case lh:i.blendFunc(i.ONE,i.ONE);break;case ch:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case uh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",w);break}else switch(w){case ws:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case lh:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ch:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case uh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",w);break}b=null,x=null,E=null,A=null,I.set(0,0,0),R=0,g=w,S=et}return}ne=ne||O,X=X||j,be=be||ee,(O!==p||ne!==y)&&(i.blendEquationSeparate(dt[O],dt[ne]),p=O,y=ne),(j!==b||ee!==x||X!==E||be!==A)&&(i.blendFuncSeparate(U[j],U[ee],U[X],U[be]),b=j,x=ee,E=X,A=be),(De.equals(I)===!1||ot!==R)&&(i.blendColor(De.r,De.g,De.b,ot),I.copy(De),R=ot),g=w,S=!1}function ze(w,O){w.side===Mn?me(i.CULL_FACE):Z(i.CULL_FACE);let j=w.side===Jt;O&&(j=!j),Y(j),w.blending===ws&&w.transparent===!1?lt(zt):lt(w.blending,w.blendEquation,w.blendSrc,w.blendDst,w.blendEquationAlpha,w.blendSrcAlpha,w.blendDstAlpha,w.blendColor,w.blendAlpha,w.premultipliedAlpha),a.setFunc(w.depthFunc),a.setTest(w.depthTest),a.setMask(w.depthWrite),r.setMask(w.colorWrite);let ee=w.stencilWrite;o.setTest(ee),ee&&(o.setMask(w.stencilWriteMask),o.setFunc(w.stencilFunc,w.stencilRef,w.stencilFuncMask),o.setOp(w.stencilFail,w.stencilZFail,w.stencilZPass)),he(w.polygonOffset,w.polygonOffsetFactor,w.polygonOffsetUnits),w.alphaToCoverage===!0?Z(i.SAMPLE_ALPHA_TO_COVERAGE):me(i.SAMPLE_ALPHA_TO_COVERAGE)}function Y(w){M!==w&&(w?i.frontFace(i.CW):i.frontFace(i.CCW),M=w)}function re(w){w!==ep?(Z(i.CULL_FACE),w!==P&&(w===oh?i.cullFace(i.BACK):w===tp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):me(i.CULL_FACE),P=w}function Be(w){w!==L&&(B&&i.lineWidth(w),L=w)}function he(w,O,j){w?(Z(i.POLYGON_OFFSET_FILL),(N!==O||z!==j)&&(i.polygonOffset(O,j),N=O,z=j)):me(i.POLYGON_OFFSET_FILL)}function Pe(w){w?Z(i.SCISSOR_TEST):me(i.SCISSOR_TEST)}function $e(w){w===void 0&&(w=i.TEXTURE0+V-1),oe!==w&&(i.activeTexture(w),oe=w)}function Je(w,O,j){j===void 0&&(oe===null?j=i.TEXTURE0+V-1:j=oe);let ee=le[j];ee===void 0&&(ee={type:void 0,texture:void 0},le[j]=ee),(ee.type!==w||ee.texture!==O)&&(oe!==j&&(i.activeTexture(j),oe=j),i.bindTexture(w,O||q[w]),ee.type=w,ee.texture=O)}function D(){let w=le[oe];w!==void 0&&w.type!==void 0&&(i.bindTexture(w.type,null),w.type=void 0,w.texture=void 0)}function v(){try{i.compressedTexImage2D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function J(){try{i.texSubImage2D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function te(){try{i.texSubImage3D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function ge(){try{i.compressedTexSubImage3D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function ae(){try{i.texStorage2D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function xe(){try{i.texStorage3D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function ye(){try{i.texImage2D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function se(){try{i.texImage3D(...arguments)}catch(w){console.error("THREE.WebGLState:",w)}}function pe(w){Ne.equals(w)===!1&&(i.scissor(w.x,w.y,w.z,w.w),Ne.copy(w))}function Le(w){Ve.equals(w)===!1&&(i.viewport(w.x,w.y,w.z,w.w),Ve.copy(w))}function Ee(w,O){let j=c.get(O);j===void 0&&(j=new WeakMap,c.set(O,j));let ee=j.get(w);ee===void 0&&(ee=i.getUniformBlockIndex(O,w.name),j.set(w,ee))}function de(w,O){let ee=c.get(O).get(w);l.get(O)!==ee&&(i.uniformBlockBinding(O,ee,w.__bindingPointIndex),l.set(O,ee))}function Ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},oe=null,le={},h={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,b=null,x=null,y=null,E=null,A=null,I=new Ie(0,0,0),R=0,S=!1,M=null,P=null,L=null,N=null,z=null,Ne.set(0,0,i.canvas.width,i.canvas.height),Ve.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Z,disable:me,bindFramebuffer:we,drawBuffers:_e,useProgram:Oe,setBlending:lt,setMaterial:ze,setFlipSided:Y,setCullFace:re,setLineWidth:Be,setPolygonOffset:he,setScissorTest:Pe,activeTexture:$e,bindTexture:Je,unbindTexture:D,compressedTexImage2D:v,compressedTexImage3D:F,texImage2D:ye,texImage3D:se,updateUBOMapping:Ee,uniformBlockBinding:de,texStorage2D:ae,texStorage3D:xe,texSubImage2D:J,texSubImage3D:te,compressedTexSubImage2D:W,compressedTexSubImage3D:ge,scissor:pe,viewport:Le,reset:Ue}}function Uv(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ce,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(D,v){return f?new OffscreenCanvas(D,v):yr("canvas")}function _(D,v,F){let J=1,te=Je(D);if((te.width>F||te.height>F)&&(J=F/Math.max(te.width,te.height)),J<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let W=Math.floor(J*te.width),ge=Math.floor(J*te.height);h===void 0&&(h=m(W,ge));let ae=v?m(W,ge):h;return ae.width=W,ae.height=ge,ae.getContext("2d").drawImage(D,0,0,W,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+W+"x"+ge+")."),ae}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),D;return D}function g(D){return D.generateMipmaps}function p(D){i.generateMipmap(D)}function b(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function x(D,v,F,J,te=!1){if(D!==null){if(i[D]!==void 0)return i[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let W=v;if(v===i.RED&&(F===i.FLOAT&&(W=i.R32F),F===i.HALF_FLOAT&&(W=i.R16F),F===i.UNSIGNED_BYTE&&(W=i.R8)),v===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.R8UI),F===i.UNSIGNED_SHORT&&(W=i.R16UI),F===i.UNSIGNED_INT&&(W=i.R32UI),F===i.BYTE&&(W=i.R8I),F===i.SHORT&&(W=i.R16I),F===i.INT&&(W=i.R32I)),v===i.RG&&(F===i.FLOAT&&(W=i.RG32F),F===i.HALF_FLOAT&&(W=i.RG16F),F===i.UNSIGNED_BYTE&&(W=i.RG8)),v===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RG8UI),F===i.UNSIGNED_SHORT&&(W=i.RG16UI),F===i.UNSIGNED_INT&&(W=i.RG32UI),F===i.BYTE&&(W=i.RG8I),F===i.SHORT&&(W=i.RG16I),F===i.INT&&(W=i.RG32I)),v===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGB8UI),F===i.UNSIGNED_SHORT&&(W=i.RGB16UI),F===i.UNSIGNED_INT&&(W=i.RGB32UI),F===i.BYTE&&(W=i.RGB8I),F===i.SHORT&&(W=i.RGB16I),F===i.INT&&(W=i.RGB32I)),v===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),F===i.UNSIGNED_INT&&(W=i.RGBA32UI),F===i.BYTE&&(W=i.RGBA8I),F===i.SHORT&&(W=i.RGBA16I),F===i.INT&&(W=i.RGBA32I)),v===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),v===i.RGBA){let ge=te?ma:Qe.getTransfer(J);F===i.FLOAT&&(W=i.RGBA32F),F===i.HALF_FLOAT&&(W=i.RGBA16F),F===i.UNSIGNED_BYTE&&(W=ge===ht?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function y(D,v){let F;return D?v===null||v===ss||v===rs?F=i.DEPTH24_STENCIL8:v===ln?F=i.DEPTH32F_STENCIL8:v===Br&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===ss||v===rs?F=i.DEPTH_COMPONENT24:v===ln?F=i.DEPTH_COMPONENT32F:v===Br&&(F=i.DEPTH_COMPONENT16),F}function E(D,v){return g(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ft&&D.minFilter!==Lt?Math.log2(Math.max(v.width,v.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?v.mipmaps.length:1}function A(D){let v=D.target;v.removeEventListener("dispose",A),R(v),v.isVideoTexture&&u.delete(v)}function I(D){let v=D.target;v.removeEventListener("dispose",I),M(v)}function R(D){let v=n.get(D);if(v.__webglInit===void 0)return;let F=D.source,J=d.get(F);if(J){let te=J[v.__cacheKey];te.usedTimes--,te.usedTimes===0&&S(D),Object.keys(J).length===0&&d.delete(F)}n.remove(D)}function S(D){let v=n.get(D);i.deleteTexture(v.__webglTexture);let F=D.source,J=d.get(F);delete J[v.__cacheKey],a.memory.textures--}function M(D){let v=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(v.__webglFramebuffer[J]))for(let te=0;te<v.__webglFramebuffer[J].length;te++)i.deleteFramebuffer(v.__webglFramebuffer[J][te]);else i.deleteFramebuffer(v.__webglFramebuffer[J]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[J])}else{if(Array.isArray(v.__webglFramebuffer))for(let J=0;J<v.__webglFramebuffer.length;J++)i.deleteFramebuffer(v.__webglFramebuffer[J]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let J=0;J<v.__webglColorRenderbuffer.length;J++)v.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[J]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let F=D.textures;for(let J=0,te=F.length;J<te;J++){let W=n.get(F[J]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(F[J])}n.remove(D)}let P=0;function L(){P=0}function N(){let D=P;return D>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+s.maxTextures),P+=1,D}function z(D){let v=[];return v.push(D.wrapS),v.push(D.wrapT),v.push(D.wrapR||0),v.push(D.magFilter),v.push(D.minFilter),v.push(D.anisotropy),v.push(D.internalFormat),v.push(D.format),v.push(D.type),v.push(D.generateMipmaps),v.push(D.premultiplyAlpha),v.push(D.flipY),v.push(D.unpackAlignment),v.push(D.colorSpace),v.join()}function V(D,v){let F=n.get(D);if(D.isVideoTexture&&Pe(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&F.__version!==D.version){let J=D.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(F,D,v);return}}else D.isExternalTexture&&(F.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+v)}function B(D,v){let F=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&F.__version!==D.version){q(F,D,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+v)}function ie(D,v){let F=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&F.__version!==D.version){q(F,D,v);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+v)}function G(D,v){let F=n.get(D);if(D.version>0&&F.__version!==D.version){Z(F,D,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+v)}let oe={[kt]:i.REPEAT,[Wn]:i.CLAMP_TO_EDGE,[gr]:i.MIRRORED_REPEAT},le={[Ft]:i.NEAREST,[Wl]:i.NEAREST_MIPMAP_NEAREST,[Gs]:i.NEAREST_MIPMAP_LINEAR,[Lt]:i.LINEAR,[zr]:i.LINEAR_MIPMAP_NEAREST,[Sn]:i.LINEAR_MIPMAP_LINEAR},Me={[wp]:i.NEVER,[Pp]:i.ALWAYS,[Ep]:i.LESS,[bh]:i.LEQUAL,[Tp]:i.EQUAL,[Cp]:i.GEQUAL,[Ap]:i.GREATER,[Rp]:i.NOTEQUAL};function Ae(D,v){if(v.type===ln&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Lt||v.magFilter===zr||v.magFilter===Gs||v.magFilter===Sn||v.minFilter===Lt||v.minFilter===zr||v.minFilter===Gs||v.minFilter===Sn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,oe[v.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,oe[v.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,oe[v.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,le[v.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,le[v.minFilter]),v.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,Me[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Ft||v.minFilter!==Gs&&v.minFilter!==Sn||v.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function Ne(D,v){let F=!1;D.__webglInit===void 0&&(D.__webglInit=!0,v.addEventListener("dispose",A));let J=v.source,te=d.get(J);te===void 0&&(te={},d.set(J,te));let W=z(v);if(W!==D.__cacheKey){te[W]===void 0&&(te[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),te[W].usedTimes++;let ge=te[D.__cacheKey];ge!==void 0&&(te[D.__cacheKey].usedTimes--,ge.usedTimes===0&&S(v)),D.__cacheKey=W,D.__webglTexture=te[W].texture}return F}function Ve(D,v,F){return Math.floor(Math.floor(D/F)/v)}function fe(D,v,F,J){let W=D.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,F,J,v.data);else{W.sort((se,pe)=>se.start-pe.start);let ge=0;for(let se=1;se<W.length;se++){let pe=W[ge],Le=W[se],Ee=pe.start+pe.count,de=Ve(Le.start,v.width,4),Ue=Ve(pe.start,v.width,4);Le.start<=Ee+1&&de===Ue&&Ve(Le.start+Le.count-1,v.width,4)===de?pe.count=Math.max(pe.count,Le.start+Le.count-pe.start):(++ge,W[ge]=Le)}W.length=ge+1;let ae=i.getParameter(i.UNPACK_ROW_LENGTH),xe=i.getParameter(i.UNPACK_SKIP_PIXELS),ye=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let se=0,pe=W.length;se<pe;se++){let Le=W[se],Ee=Math.floor(Le.start/4),de=Math.ceil(Le.count/4),Ue=Ee%v.width,w=Math.floor(Ee/v.width),O=de,j=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ue),i.pixelStorei(i.UNPACK_SKIP_ROWS,w),t.texSubImage2D(i.TEXTURE_2D,0,Ue,w,O,j,F,J,v.data)}D.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ae),i.pixelStorei(i.UNPACK_SKIP_PIXELS,xe),i.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function q(D,v,F){let J=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(J=i.TEXTURE_3D);let te=Ne(D,v),W=v.source;t.bindTexture(J,D.__webglTexture,i.TEXTURE0+F);let ge=n.get(W);if(W.version!==ge.__version||te===!0){t.activeTexture(i.TEXTURE0+F);let ae=Qe.getPrimaries(Qe.workingColorSpace),xe=v.colorSpace===On?null:Qe.getPrimaries(v.colorSpace),ye=v.colorSpace===On||ae===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let se=_(v.image,!1,s.maxTextureSize);se=$e(v,se);let pe=r.convert(v.format,v.colorSpace),Le=r.convert(v.type),Ee=x(v.internalFormat,pe,Le,v.colorSpace,v.isVideoTexture);Ae(J,v);let de,Ue=v.mipmaps,w=v.isVideoTexture!==!0,O=ge.__version===void 0||te===!0,j=W.dataReady,ee=E(v,se);if(v.isDepthTexture)Ee=y(v.format===as,v.type),O&&(w?t.texStorage2D(i.TEXTURE_2D,1,Ee,se.width,se.height):t.texImage2D(i.TEXTURE_2D,0,Ee,se.width,se.height,0,pe,Le,null));else if(v.isDataTexture)if(Ue.length>0){w&&O&&t.texStorage2D(i.TEXTURE_2D,ee,Ee,Ue[0].width,Ue[0].height);for(let ne=0,X=Ue.length;ne<X;ne++)de=Ue[ne],w?j&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,de.width,de.height,pe,Le,de.data):t.texImage2D(i.TEXTURE_2D,ne,Ee,de.width,de.height,0,pe,Le,de.data);v.generateMipmaps=!1}else w?(O&&t.texStorage2D(i.TEXTURE_2D,ee,Ee,se.width,se.height),j&&fe(v,se,pe,Le)):t.texImage2D(i.TEXTURE_2D,0,Ee,se.width,se.height,0,pe,Le,se.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){w&&O&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ee,Ee,Ue[0].width,Ue[0].height,se.depth);for(let ne=0,X=Ue.length;ne<X;ne++)if(de=Ue[ne],v.format!==_n)if(pe!==null)if(w){if(j)if(v.layerUpdates.size>0){let be=Ph(de.width,de.height,v.format,v.type);for(let De of v.layerUpdates){let ot=de.data.subarray(De*be/de.data.BYTES_PER_ELEMENT,(De+1)*be/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,De,de.width,de.height,1,pe,ot)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,de.width,de.height,se.depth,pe,de.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ne,Ee,de.width,de.height,se.depth,0,de.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else w?j&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,de.width,de.height,se.depth,pe,Le,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ne,Ee,de.width,de.height,se.depth,0,pe,Le,de.data)}else{w&&O&&t.texStorage2D(i.TEXTURE_2D,ee,Ee,Ue[0].width,Ue[0].height);for(let ne=0,X=Ue.length;ne<X;ne++)de=Ue[ne],v.format!==_n?pe!==null?w?j&&t.compressedTexSubImage2D(i.TEXTURE_2D,ne,0,0,de.width,de.height,pe,de.data):t.compressedTexImage2D(i.TEXTURE_2D,ne,Ee,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):w?j&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,de.width,de.height,pe,Le,de.data):t.texImage2D(i.TEXTURE_2D,ne,Ee,de.width,de.height,0,pe,Le,de.data)}else if(v.isDataArrayTexture)if(w){if(O&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ee,Ee,se.width,se.height,se.depth),j)if(v.layerUpdates.size>0){let ne=Ph(se.width,se.height,v.format,v.type);for(let X of v.layerUpdates){let be=se.data.subarray(X*ne/se.data.BYTES_PER_ELEMENT,(X+1)*ne/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,X,se.width,se.height,1,pe,Le,be)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,pe,Le,se.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ee,se.width,se.height,se.depth,0,pe,Le,se.data);else if(v.isData3DTexture)w?(O&&t.texStorage3D(i.TEXTURE_3D,ee,Ee,se.width,se.height,se.depth),j&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,pe,Le,se.data)):t.texImage3D(i.TEXTURE_3D,0,Ee,se.width,se.height,se.depth,0,pe,Le,se.data);else if(v.isFramebufferTexture){if(O)if(w)t.texStorage2D(i.TEXTURE_2D,ee,Ee,se.width,se.height);else{let ne=se.width,X=se.height;for(let be=0;be<ee;be++)t.texImage2D(i.TEXTURE_2D,be,Ee,ne,X,0,pe,Le,null),ne>>=1,X>>=1}}else if(Ue.length>0){if(w&&O){let ne=Je(Ue[0]);t.texStorage2D(i.TEXTURE_2D,ee,Ee,ne.width,ne.height)}for(let ne=0,X=Ue.length;ne<X;ne++)de=Ue[ne],w?j&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,pe,Le,de):t.texImage2D(i.TEXTURE_2D,ne,Ee,pe,Le,de);v.generateMipmaps=!1}else if(w){if(O){let ne=Je(se);t.texStorage2D(i.TEXTURE_2D,ee,Ee,ne.width,ne.height)}j&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,pe,Le,se)}else t.texImage2D(i.TEXTURE_2D,0,Ee,pe,Le,se);g(v)&&p(J),ge.__version=W.version,v.onUpdate&&v.onUpdate(v)}D.__version=v.version}function Z(D,v,F){if(v.image.length!==6)return;let J=Ne(D,v),te=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+F);let W=n.get(te);if(te.version!==W.__version||J===!0){t.activeTexture(i.TEXTURE0+F);let ge=Qe.getPrimaries(Qe.workingColorSpace),ae=v.colorSpace===On?null:Qe.getPrimaries(v.colorSpace),xe=v.colorSpace===On||ge===ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let ye=v.isCompressedTexture||v.image[0].isCompressedTexture,se=v.image[0]&&v.image[0].isDataTexture,pe=[];for(let X=0;X<6;X++)!ye&&!se?pe[X]=_(v.image[X],!0,s.maxCubemapSize):pe[X]=se?v.image[X].image:v.image[X],pe[X]=$e(v,pe[X]);let Le=pe[0],Ee=r.convert(v.format,v.colorSpace),de=r.convert(v.type),Ue=x(v.internalFormat,Ee,de,v.colorSpace),w=v.isVideoTexture!==!0,O=W.__version===void 0||J===!0,j=te.dataReady,ee=E(v,Le);Ae(i.TEXTURE_CUBE_MAP,v);let ne;if(ye){w&&O&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ee,Ue,Le.width,Le.height);for(let X=0;X<6;X++){ne=pe[X].mipmaps;for(let be=0;be<ne.length;be++){let De=ne[be];v.format!==_n?Ee!==null?w?j&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be,0,0,De.width,De.height,Ee,De.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be,Ue,De.width,De.height,0,De.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):w?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be,0,0,De.width,De.height,Ee,de,De.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be,Ue,De.width,De.height,0,Ee,de,De.data)}}}else{if(ne=v.mipmaps,w&&O){ne.length>0&&ee++;let X=Je(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ee,Ue,X.width,X.height)}for(let X=0;X<6;X++)if(se){w?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,pe[X].width,pe[X].height,Ee,de,pe[X].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ue,pe[X].width,pe[X].height,0,Ee,de,pe[X].data);for(let be=0;be<ne.length;be++){let ot=ne[be].image[X].image;w?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be+1,0,0,ot.width,ot.height,Ee,de,ot.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be+1,Ue,ot.width,ot.height,0,Ee,de,ot.data)}}else{w?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,Ee,de,pe[X]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ue,Ee,de,pe[X]);for(let be=0;be<ne.length;be++){let De=ne[be];w?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be+1,0,0,Ee,de,De.image[X]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,be+1,Ue,Ee,de,De.image[X])}}}g(v)&&p(i.TEXTURE_CUBE_MAP),W.__version=te.version,v.onUpdate&&v.onUpdate(v)}D.__version=v.version}function me(D,v,F,J,te,W){let ge=r.convert(F.format,F.colorSpace),ae=r.convert(F.type),xe=x(F.internalFormat,ge,ae,F.colorSpace),ye=n.get(v),se=n.get(F);if(se.__renderTarget=v,!ye.__hasExternalTextures){let pe=Math.max(1,v.width>>W),Le=Math.max(1,v.height>>W);te===i.TEXTURE_3D||te===i.TEXTURE_2D_ARRAY?t.texImage3D(te,W,xe,pe,Le,v.depth,0,ge,ae,null):t.texImage2D(te,W,xe,pe,Le,0,ge,ae,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),he(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,te,se.__webglTexture,0,Be(v)):(te===i.TEXTURE_2D||te>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,te,se.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function we(D,v,F){if(i.bindRenderbuffer(i.RENDERBUFFER,D),v.depthBuffer){let J=v.depthTexture,te=J&&J.isDepthTexture?J.type:null,W=y(v.stencilBuffer,te),ge=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=Be(v);he(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,W,v.width,v.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,W,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,W,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,D)}else{let J=v.textures;for(let te=0;te<J.length;te++){let W=J[te],ge=r.convert(W.format,W.colorSpace),ae=r.convert(W.type),xe=x(W.internalFormat,ge,ae,W.colorSpace),ye=Be(v);F&&he(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ye,xe,v.width,v.height):he(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ye,xe,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,xe,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function _e(D,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=n.get(v.depthTexture);J.__renderTarget=v,(!J.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),V(v.depthTexture,0);let te=J.__webglTexture,W=Be(v);if(v.depthTexture.format===_r)he(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0);else if(v.depthTexture.format===as)he(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function Oe(D){let v=n.get(D),F=D.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==D.depthTexture){let J=D.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),J){let te=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,J.removeEventListener("dispose",te)};J.addEventListener("dispose",te),v.__depthDisposeCallback=te}v.__boundDepthTexture=J}if(D.depthTexture&&!v.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");let J=D.texture.mipmaps;J&&J.length>0?_e(v.__webglFramebuffer[0],D):_e(v.__webglFramebuffer,D)}else if(F){v.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[J]),v.__webglDepthbuffer[J]===void 0)v.__webglDepthbuffer[J]=i.createRenderbuffer(),we(v.__webglDepthbuffer[J],D,!1);else{let te=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,W)}}else{let J=D.texture.mipmaps;if(J&&J.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),we(v.__webglDepthbuffer,D,!1);else{let te=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function dt(D,v,F){let J=n.get(D);v!==void 0&&me(J.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Oe(D)}function U(D){let v=D.texture,F=n.get(D),J=n.get(v);D.addEventListener("dispose",I);let te=D.textures,W=D.isWebGLCubeRenderTarget===!0,ge=te.length>1;if(ge||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=v.version,a.memory.textures++),W){F.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer[ae]=[];for(let xe=0;xe<v.mipmaps.length;xe++)F.__webglFramebuffer[ae][xe]=i.createFramebuffer()}else F.__webglFramebuffer[ae]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer=[];for(let ae=0;ae<v.mipmaps.length;ae++)F.__webglFramebuffer[ae]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ge)for(let ae=0,xe=te.length;ae<xe;ae++){let ye=n.get(te[ae]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),a.memory.textures++)}if(D.samples>0&&he(D)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ae=0;ae<te.length;ae++){let xe=te[ae];F.__webglColorRenderbuffer[ae]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ae]);let ye=r.convert(xe.format,xe.colorSpace),se=r.convert(xe.type),pe=x(xe.internalFormat,ye,se,xe.colorSpace,D.isXRRenderTarget===!0),Le=Be(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,Le,pe,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,F.__webglColorRenderbuffer[ae])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),we(F.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Ae(i.TEXTURE_CUBE_MAP,v);for(let ae=0;ae<6;ae++)if(v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)me(F.__webglFramebuffer[ae][xe],D,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe);else me(F.__webglFramebuffer[ae],D,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);g(v)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let ae=0,xe=te.length;ae<xe;ae++){let ye=te[ae],se=n.get(ye),pe=i.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(pe=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,se.__webglTexture),Ae(pe,ye),me(F.__webglFramebuffer,D,ye,i.COLOR_ATTACHMENT0+ae,pe,0),g(ye)&&p(pe)}t.unbindTexture()}else{let ae=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ae=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,J.__webglTexture),Ae(ae,v),v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)me(F.__webglFramebuffer[xe],D,v,i.COLOR_ATTACHMENT0,ae,xe);else me(F.__webglFramebuffer,D,v,i.COLOR_ATTACHMENT0,ae,0);g(v)&&p(ae),t.unbindTexture()}D.depthBuffer&&Oe(D)}function lt(D){let v=D.textures;for(let F=0,J=v.length;F<J;F++){let te=v[F];if(g(te)){let W=b(D),ge=n.get(te).__webglTexture;t.bindTexture(W,ge),p(W),t.unbindTexture()}}}let ze=[],Y=[];function re(D){if(D.samples>0){if(he(D)===!1){let v=D.textures,F=D.width,J=D.height,te=i.COLOR_BUFFER_BIT,W=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(D),ae=v.length>1;if(ae)for(let ye=0;ye<v.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);let xe=D.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ye=0;ye<v.length;ye++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(te|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(te|=i.STENCIL_BUFFER_BIT)),ae){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ye]);let se=n.get(v[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,se,0)}i.blitFramebuffer(0,0,F,J,0,0,F,J,te,i.NEAREST),l===!0&&(ze.length=0,Y.length=0,ze.push(i.COLOR_ATTACHMENT0+ye),D.depthBuffer&&D.resolveDepthBuffer===!1&&(ze.push(W),Y.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Y)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ze))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ae)for(let ye=0;ye<v.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ye]);let se=n.get(v[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,se,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&l){let v=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Be(D){return Math.min(s.maxSamples,D.samples)}function he(D){let v=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Pe(D){let v=a.render.frame;u.get(D)!==v&&(u.set(D,v),D.update())}function $e(D,v){let F=D.colorSpace,J=D.format,te=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||F!==Ht&&F!==On&&(Qe.getTransfer(F)===ht?(J!==_n||te!==Fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),v}function Je(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=L,this.setTexture2D=V,this.setTexture2DArray=B,this.setTexture3D=ie,this.setTextureCube=G,this.rebindTextures=dt,this.setupRenderTarget=U,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=re,this.setupDepthRenderbuffer=Oe,this.setupFrameBufferTexture=me,this.useMultisampledRTT=he}function Nv(i,e){function t(n,s=On){let r,a=Qe.getTransfer(s);if(n===Fn)return i.UNSIGNED_BYTE;if(n===ql)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Xl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===mh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===gh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===fh)return i.BYTE;if(n===ph)return i.SHORT;if(n===Br)return i.UNSIGNED_SHORT;if(n===jl)return i.INT;if(n===ss)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===Ut)return i.HALF_FLOAT;if(n===_h)return i.ALPHA;if(n===yh)return i.RGB;if(n===_n)return i.RGBA;if(n===_r)return i.DEPTH_COMPONENT;if(n===as)return i.DEPTH_STENCIL;if(n===Yl)return i.RED;if(n===$l)return i.RED_INTEGER;if(n===xh)return i.RG;if(n===Zl)return i.RG_INTEGER;if(n===Kl)return i.RGBA_INTEGER;if(n===no||n===io||n===so||n===ro)if(a===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===no)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===so)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===no)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===so)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ro)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Jl||n===Ql||n===ec||n===tc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Jl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ql)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ec)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===nc||n===ic||n===sc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===nc||n===ic)return a===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===sc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===rc||n===ac||n===oc||n===lc||n===cc||n===uc||n===hc||n===dc||n===fc||n===pc||n===mc||n===gc||n===_c||n===yc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===rc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ac)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===oc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===lc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===cc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===uc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===hc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===dc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===fc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===pc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===mc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===gc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===_c)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===yc)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===xc||n===vc||n===bc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===xc)return a===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===vc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===bc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Mc||n===Sc||n===wc||n===Ec)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Mc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Sc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===wc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ec)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===rs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Fv=`
void main() {

  gl_Position = vec4( position, 1.0 );

}`,Ov=`
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

}`,Gh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Aa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new St({vertexShader:Fv,fragmentShader:Ov,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new it(new Fi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Wh=class extends ui{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,m=null,_=typeof XRWebGLBinding<"u",g=new Gh,p={},b=t.getContextAttributes(),x=null,y=null,E=[],A=[],I=new ce,R=null,S=new It;S.viewport=new st;let M=new It;M.viewport=new st;let P=[S,M],L=new Rl,N=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Z=E[q];return Z===void 0&&(Z=new wr,E[q]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(q){let Z=E[q];return Z===void 0&&(Z=new wr,E[q]=Z),Z.getGripSpace()},this.getHand=function(q){let Z=E[q];return Z===void 0&&(Z=new wr,E[q]=Z),Z.getHandSpace()};function V(q){let Z=A.indexOf(q.inputSource);if(Z===-1)return;let me=E[Z];me!==void 0&&(me.update(q.inputSource,q.frame,c||a),me.dispatchEvent({type:q.type,data:q.inputSource}))}function B(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",ie);for(let q=0;q<E.length;q++){let Z=A[q];Z!==null&&(A[q]=null,E[q].disconnect(Z))}N=null,z=null,g.reset();for(let q in p)delete p[q];e.setRenderTarget(x),f=null,d=null,h=null,s=null,y=null,fe.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",B),s.addEventListener("inputsourceschange",ie),b.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(I),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,we=null,_e=null;b.depth&&(_e=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=b.stencil?as:_r,we=b.stencil?rs:ss);let Oe={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Oe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Vt(d.textureWidth,d.textureHeight,{format:_n,type:Fn,depthTexture:new Is(d.textureWidth,d.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let me={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,me),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Vt(f.framebufferWidth,f.framebufferHeight,{format:_n,type:Fn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),fe.setContext(s),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ie(q){for(let Z=0;Z<q.removed.length;Z++){let me=q.removed[Z],we=A.indexOf(me);we>=0&&(A[we]=null,E[we].disconnect(me))}for(let Z=0;Z<q.added.length;Z++){let me=q.added[Z],we=A.indexOf(me);if(we===-1){for(let Oe=0;Oe<E.length;Oe++)if(Oe>=A.length){A.push(me),we=Oe;break}else if(A[Oe]===null){A[Oe]=me,we=Oe;break}if(we===-1)break}let _e=E[we];_e&&_e.connect(me)}}let G=new C,oe=new C;function le(q,Z,me){G.setFromMatrixPosition(Z.matrixWorld),oe.setFromMatrixPosition(me.matrixWorld);let we=G.distanceTo(oe),_e=Z.projectionMatrix.elements,Oe=me.projectionMatrix.elements,dt=_e[14]/(_e[10]-1),U=_e[14]/(_e[10]+1),lt=(_e[9]+1)/_e[5],ze=(_e[9]-1)/_e[5],Y=(_e[8]-1)/_e[0],re=(Oe[8]+1)/Oe[0],Be=dt*Y,he=dt*re,Pe=we/(-Y+re),$e=Pe*-Y;if(Z.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX($e),q.translateZ(Pe),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),_e[10]===-1)q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{let Je=dt+Pe,D=U+Pe,v=Be-$e,F=he+(we-$e),J=lt*U/D*Je,te=ze*U/D*Je;q.projectionMatrix.makePerspective(v,F,J,te,Je,D),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Me(q,Z){Z===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Z.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let Z=q.near,me=q.far;g.texture!==null&&(g.depthNear>0&&(Z=g.depthNear),g.depthFar>0&&(me=g.depthFar)),L.near=M.near=S.near=Z,L.far=M.far=S.far=me,(N!==L.near||z!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),N=L.near,z=L.far),L.layers.mask=q.layers.mask|6,S.layers.mask=L.layers.mask&3,M.layers.mask=L.layers.mask&5;let we=q.parent,_e=L.cameras;Me(L,we);for(let Oe=0;Oe<_e.length;Oe++)Me(_e[Oe],we);_e.length===2?le(L,S,M):L.projectionMatrix.copy(S.projectionMatrix),Ae(q,L,we)};function Ae(q,Z,me){me===null?q.matrix.copy(Z.matrixWorld):(q.matrix.copy(me.matrixWorld),q.matrix.invert(),q.matrix.multiply(Z.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Rs*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(L)},this.getCameraTexture=function(q){return p[q]};let Ne=null;function Ve(q,Z){if(u=Z.getViewerPose(c||a),m=Z,u!==null){let me=u.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let we=!1;me.length!==L.cameras.length&&(L.cameras.length=0,we=!0);for(let U=0;U<me.length;U++){let lt=me[U],ze=null;if(f!==null)ze=f.getViewport(lt);else{let re=h.getViewSubImage(d,lt);ze=re.viewport,U===0&&(e.setRenderTargetTextures(y,re.colorTexture,re.depthStencilTexture),e.setRenderTarget(y))}let Y=P[U];Y===void 0&&(Y=new It,Y.layers.enable(U),Y.viewport=new st,P[U]=Y),Y.matrix.fromArray(lt.transform.matrix),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.projectionMatrix.fromArray(lt.projectionMatrix),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert(),Y.viewport.set(ze.x,ze.y,ze.width,ze.height),U===0&&(L.matrix.copy(Y.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),we===!0&&L.cameras.push(Y)}let _e=s.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){h=n.getBinding();let U=h.getDepthInformation(me[0]);U&&U.isValid&&U.texture&&g.init(U,s.renderState)}if(_e&&_e.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let U=0;U<me.length;U++){let lt=me[U].camera;if(lt){let ze=p[lt];ze||(ze=new Aa,p[lt]=ze);let Y=h.getCameraImage(lt);ze.sourceTexture=Y}}}}for(let me=0;me<E.length;me++){let we=A[me],_e=E[me];we!==null&&_e!==void 0&&_e.update(we,Z,c||a)}Ne&&Ne(q,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),m=null}let fe=new cm;fe.setAnimationLoop(Ve),this.setAnimationLoop=function(q){Ne=q},this.dispose=function(){}}},qs=new ii,zv=new Re;function Bv(i,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,Th(i)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,b,x,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),h(g,p)):p.isMeshPhongMaterial?(r(g,p),u(g,p)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,y)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,b,x):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Jt&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Jt&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let b=e.get(p),x=b.envMap,y=b.envMapRotation;x&&(g.envMap.value=x,qs.copy(y),qs.x*=-1,qs.y*=-1,qs.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(qs.y*=-1,qs.z*=-1),g.envMapRotation.value.setFromMatrix4(zv.makeRotationFromEuler(qs)),g.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,b,x){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*b,g.scale.value=x*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function u(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function h(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,b){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Jt&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let b=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function kv(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,x){let y=x.program;n.uniformBlockBinding(b,y)}function c(b,x){let y=s[b.id];y===void 0&&(m(b),y=u(b),s[b.id]=y,b.addEventListener("dispose",g));let E=x.program;n.updateUBOMapping(b,E);let A=e.render.frame;r[b.id]!==A&&(d(b),r[b.id]=A)}function u(b){let x=h();b.__bindingPointIndex=x;let y=i.createBuffer(),E=b.__size,A=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,E,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,y),y}function h(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){let x=s[b.id],y=b.uniforms,E=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let A=0,I=y.length;A<I;A++){let R=Array.isArray(y[A])?y[A]:[y[A]];for(let S=0,M=R.length;S<M;S++){let P=R[S];if(f(P,A,S,E)===!0){let L=P.__offset,N=Array.isArray(P.value)?P.value:[P.value],z=0;for(let V=0;V<N.length;V++){let B=N[V],ie=_(B);typeof B=="number"||typeof B=="boolean"?(P.__data[0]=B,i.bufferSubData(i.UNIFORM_BUFFER,L+z,P.__data)):B.isMatrix3?(P.__data[0]=B.elements[0],P.__data[1]=B.elements[1],P.__data[2]=B.elements[2],P.__data[3]=0,P.__data[4]=B.elements[3],P.__data[5]=B.elements[4],P.__data[6]=B.elements[5],P.__data[7]=0,P.__data[8]=B.elements[6],P.__data[9]=B.elements[7],P.__data[10]=B.elements[8],P.__data[11]=0):(B.toArray(P.__data,z),z+=ie.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(b,x,y,E){let A=b.value,I=x+"_"+y;if(E[I]===void 0)return typeof A=="number"||typeof A=="boolean"?E[I]=A:E[I]=A.clone(),!0;{let R=E[I];if(typeof A=="number"||typeof A=="boolean"){if(R!==A)return E[I]=A,!0}else if(R.equals(A)===!1)return R.copy(A),!0}return!1}function m(b){let x=b.uniforms,y=0,E=16;for(let I=0,R=x.length;I<R;I++){let S=Array.isArray(x[I])?x[I]:[x[I]];for(let M=0,P=S.length;M<P;M++){let L=S[M],N=Array.isArray(L.value)?L.value:[L.value];for(let z=0,V=N.length;z<V;z++){let B=N[z],ie=_(B),G=y%E,oe=G%ie.boundary,le=G+oe;y+=oe,le!==0&&E-le<ie.storage&&(y+=E-le),L.__data=new Float32Array(ie.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=y,y+=ie.storage}}}let A=y%E;return A>0&&(y+=E-A),b.__size=y,b.__cache={},this}function _(b){let x={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(x.boundary=4,x.storage=4):b.isVector2?(x.boundary=8,x.storage=8):b.isVector3||b.isColor?(x.boundary=16,x.storage=12):b.isVector4?(x.boundary=16,x.storage=16):b.isMatrix3?(x.boundary=48,x.storage=48):b.isMatrix4?(x.boundary=64,x.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),x}function g(b){let x=b.target;x.removeEventListener("dispose",g);let y=a.indexOf(x.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Pc=class{constructor(e={}){let{canvas:t=Ip(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let m=new Uint32Array(4),_=new Int32Array(4),g=null,p=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Vi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,E=!1;this._outputColorSpace=Rt;let A=0,I=0,R=null,S=-1,M=null,P=new st,L=new st,N=null,z=new Ie(0),V=0,B=t.width,ie=t.height,G=1,oe=null,le=null,Me=new st(0,0,B,ie),Ae=new st(0,0,B,ie),Ne=!1,Ve=new is,fe=!1,q=!1,Z=new Re,me=new C,we=new st,_e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Oe=!1;function dt(){return R===null?G:1}let U=n;function lt(T,k){return t.getContext(T,k)}try{let T={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",j,!1),t.addEventListener("webglcontextrestored",ee,!1),t.addEventListener("webglcontextcreationerror",ne,!1),U===null){let k="webgl2";if(U=lt(k,T),U===null)throw lt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let ze,Y,re,Be,he,Pe,$e,Je,D,v,F,J,te,W,ge,ae,xe,ye,se,pe,Le,Ee,de,Ue;function w(){ze=new sx(U),ze.init(),Ee=new Nv(U,ze),Y=new Ky(U,ze,e,Ee),re=new Lv(U,ze),Y.reversedDepthBuffer&&d&&re.buffers.depth.setReversed(!0),Be=new ox(U),he=new vv,Pe=new Uv(U,ze,re,he,Y,Ee,Be),$e=new Qy(y),Je=new ix(y),D=new f_(U),de=new $y(U,D),v=new rx(U,D,Be,de),F=new cx(U,v,D,Be),se=new lx(U,Y,Pe),ae=new Jy(he),J=new xv(y,$e,Je,ze,Y,de,ae),te=new Bv(y,he),W=new Mv,ge=new Rv(ze),ye=new Yy(y,$e,Je,re,F,f,l),xe=new Iv(y,F,Y),Ue=new kv(U,Be,Y,re),pe=new Zy(U,ze,Be),Le=new ax(U,ze,Be),Be.programs=J.programs,y.capabilities=Y,y.extensions=ze,y.properties=he,y.renderLists=W,y.shadowMap=xe,y.state=re,y.info=Be}w();let O=new Wh(y,U);this.xr=O,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let T=ze.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ze.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(T){T!==void 0&&(G=T,this.setSize(B,ie,!1))},this.getSize=function(T){return T.set(B,ie)},this.setSize=function(T,k,$=!0){if(O.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}B=T,ie=k,t.width=Math.floor(T*G),t.height=Math.floor(k*G),$===!0&&(t.style.width=T+"px",t.style.height=k+"px"),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(B*G,ie*G).floor()},this.setDrawingBufferSize=function(T,k,$){B=T,ie=k,G=$,t.width=Math.floor(T*$),t.height=Math.floor(k*$),this.setViewport(0,0,T,k)},this.getCurrentViewport=function(T){return T.copy(P)},this.getViewport=function(T){return T.copy(Me)},this.setViewport=function(T,k,$,K){T.isVector4?Me.set(T.x,T.y,T.z,T.w):Me.set(T,k,$,K),re.viewport(P.copy(Me).multiplyScalar(G).round())},this.getScissor=function(T){return T.copy(Ae)},this.setScissor=function(T,k,$,K){T.isVector4?Ae.set(T.x,T.y,T.z,T.w):Ae.set(T,k,$,K),re.scissor(L.copy(Ae).multiplyScalar(G).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(T){re.setScissorTest(Ne=T)},this.setOpaqueSort=function(T){oe=T},this.setTransparentSort=function(T){le=T},this.getClearColor=function(T){return T.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(T=!0,k=!0,$=!0){let K=0;if(T){let H=!1;if(R!==null){let ue=R.texture.format;H=ue===Kl||ue===Zl||ue===$l}if(H){let ue=R.texture.type,Se=ue===Fn||ue===ss||ue===Br||ue===rs||ue===ql||ue===Xl,Ce=ye.getClearColor(),Te=ye.getClearAlpha(),He=Ce.r,Ge=Ce.g,Fe=Ce.b;Se?(m[0]=He,m[1]=Ge,m[2]=Fe,m[3]=Te,U.clearBufferuiv(U.COLOR,0,m)):(_[0]=He,_[1]=Ge,_[2]=Fe,_[3]=Te,U.clearBufferiv(U.COLOR,0,_))}else K|=U.COLOR_BUFFER_BIT}k&&(K|=U.DEPTH_BUFFER_BIT),$&&(K|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",j,!1),t.removeEventListener("webglcontextrestored",ee,!1),t.removeEventListener("webglcontextcreationerror",ne,!1),ye.dispose(),W.dispose(),ge.dispose(),he.dispose(),$e.dispose(),Je.dispose(),F.dispose(),de.dispose(),Ue.dispose(),J.dispose(),O.dispose(),O.removeEventListener("sessionstart",An),O.removeEventListener("sessionend",fn),kn.stop()};function j(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function ee(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;let T=Be.autoReset,k=xe.enabled,$=xe.autoUpdate,K=xe.needsUpdate,H=xe.type;w(),Be.autoReset=T,xe.enabled=k,xe.autoUpdate=$,xe.needsUpdate=K,xe.type=H}function ne(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function X(T){let k=T.target;k.removeEventListener("dispose",X),be(k)}function be(T){De(T),he.remove(T)}function De(T){let k=he.get(T).programs;k!==void 0&&(k.forEach(function($){J.releaseProgram($)}),T.isShaderMaterial&&J.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,$,K,H,ue){k===null&&(k=_e);let Se=H.isMesh&&H.matrixWorld.determinant()<0,Ce=Rg(T,k,$,K,H);re.setMaterial(K,Se);let Te=$.index,He=1;if(K.wireframe===!0){if(Te=v.getWireframeAttribute($),Te===void 0)return;He=2}let Ge=$.drawRange,Fe=$.attributes.position,nt=Ge.start*He,_t=(Ge.start+Ge.count)*He;ue!==null&&(nt=Math.max(nt,ue.start*He),_t=Math.min(_t,(ue.start+ue.count)*He)),Te!==null?(nt=Math.max(nt,0),_t=Math.min(_t,Te.count)):Fe!=null&&(nt=Math.max(nt,0),_t=Math.min(_t,Fe.count));let Pt=_t-nt;if(Pt<0||Pt===1/0)return;de.setup(H,K,Ce,$,Te);let Mt,xt=pe;if(Te!==null&&(Mt=D.get(Te),xt=Le,xt.setIndex(Mt)),H.isMesh)K.wireframe===!0?(re.setLineWidth(K.wireframeLinewidth*dt()),xt.setMode(U.LINES)):xt.setMode(U.TRIANGLES);else if(H.isLine){let ke=K.linewidth;ke===void 0&&(ke=1),re.setLineWidth(ke*dt()),H.isLineSegments?xt.setMode(U.LINES):H.isLineLoop?xt.setMode(U.LINE_LOOP):xt.setMode(U.LINE_STRIP)}else H.isPoints?xt.setMode(U.POINTS):H.isSprite&&xt.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(H._multiDrawInstances!==null)xr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xt.renderMultiDrawInstances(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount,H._multiDrawInstances);else if(ze.get("WEBGL_multi_draw"))xt.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{let ke=H._multiDrawStarts,Tt=H._multiDrawCounts,ct=H._multiDrawCount,Rn=Te?D.get(Te).bytesPerElement:1,Js=he.get(K).currentProgram.getUniforms();for(let Cn=0;Cn<ct;Cn++)Js.setValue(U,"_gl_DrawID",Cn),xt.render(ke[Cn]/Rn,Tt[Cn])}else if(H.isInstancedMesh)xt.renderInstances(nt,Pt,H.count);else if($.isInstancedBufferGeometry){let ke=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Tt=Math.min($.instanceCount,ke);xt.renderInstances(nt,Pt,Tt)}else xt.render(nt,Pt)};function ot(T,k,$){T.transparent===!0&&T.side===Mn&&T.forceSinglePass===!1?(T.side=Jt,T.needsUpdate=!0,Do(T,k,$),T.side=ni,T.needsUpdate=!0,Do(T,k,$),T.side=Mn):Do(T,k,$)}this.compile=function(T,k,$=null){$===null&&($=T),p=ge.get($),p.init(k),x.push(p),$.traverseVisible(function(H){H.isLight&&H.layers.test(k.layers)&&(p.pushLight(H),H.castShadow&&p.pushShadow(H))}),T!==$&&T.traverseVisible(function(H){H.isLight&&H.layers.test(k.layers)&&(p.pushLight(H),H.castShadow&&p.pushShadow(H))}),p.setupLights();let K=new Set;return T.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;let ue=H.material;if(ue)if(Array.isArray(ue))for(let Se=0;Se<ue.length;Se++){let Ce=ue[Se];ot(Ce,$,H),K.add(Ce)}else ot(ue,$,H),K.add(ue)}),p=x.pop(),K},this.compileAsync=function(T,k,$=null){let K=this.compile(T,k,$);return new Promise(H=>{function ue(){if(K.forEach(function(Se){he.get(Se).currentProgram.isReady()&&K.delete(Se)}),K.size===0){H(T);return}setTimeout(ue,10)}ze.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let et=null;function dn(T){et&&et(T)}function An(){kn.stop()}function fn(){kn.start()}let kn=new cm;kn.setAnimationLoop(dn),typeof self<"u"&&kn.setContext(self),this.setAnimationLoop=function(T){et=T,O.setAnimationLoop(T),T===null?kn.stop():kn.start()},O.addEventListener("sessionstart",An),O.addEventListener("sessionend",fn),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),O.enabled===!0&&O.isPresenting===!0&&(O.cameraAutoUpdate===!0&&O.updateCamera(k),k=O.getCamera()),T.isScene===!0&&T.onBeforeRender(y,T,k,R),p=ge.get(T,x.length),p.init(k),x.push(p),Z.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Ve.setFromProjectionMatrix(Z,ti,k.reversedDepth),q=this.localClippingEnabled,fe=ae.init(this.clippingPlanes,q),g=W.get(T,b.length),g.init(),b.push(g),O.enabled===!0&&O.isPresenting===!0){let ue=y.xr.getDepthSensingMesh();ue!==null&&ou(ue,k,-1/0,y.sortObjects)}ou(T,k,0,y.sortObjects),g.finish(),y.sortObjects===!0&&g.sort(oe,le),Oe=O.enabled===!1||O.isPresenting===!1||O.hasDepthSensing()===!1,Oe&&ye.addToRenderList(g,T),this.info.render.frame++,fe===!0&&ae.beginShadows();let $=p.state.shadowsArray;xe.render($,T,k),fe===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();let K=g.opaque,H=g.transmissive;if(p.setupLights(),k.isArrayCamera){let ue=k.cameras;if(H.length>0)for(let Se=0,Ce=ue.length;Se<Ce;Se++){let Te=ue[Se];Yd(K,H,T,Te)}Oe&&ye.render(T);for(let Se=0,Ce=ue.length;Se<Ce;Se++){let Te=ue[Se];Xd(g,T,Te,Te.viewport)}}else H.length>0&&Yd(K,H,T,k),Oe&&ye.render(T),Xd(g,T,k);R!==null&&I===0&&(Pe.updateMultisampleRenderTarget(R),Pe.updateRenderTargetMipmap(R)),T.isScene===!0&&T.onAfterRender(y,T,k),de.resetDefaultState(),S=-1,M=null,x.pop(),x.length>0?(p=x[x.length-1],fe===!0&&ae.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,b.pop(),b.length>0?g=b[b.length-1]:g=null};function ou(T,k,$,K){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)$=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Ve.intersectsSprite(T)){K&&we.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Z);let Se=F.update(T),Ce=T.material;Ce.visible&&g.push(T,Se,Ce,$,we.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Ve.intersectsObject(T))){let Se=F.update(T),Ce=T.material;if(K&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),we.copy(T.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),we.copy(Se.boundingSphere.center)),we.applyMatrix4(T.matrixWorld).applyMatrix4(Z)),Array.isArray(Ce)){let Te=Se.groups;for(let He=0,Ge=Te.length;He<Ge;He++){let Fe=Te[He],nt=Ce[Fe.materialIndex];nt&&nt.visible&&g.push(T,Se,nt,$,we.z,Fe)}}else Ce.visible&&g.push(T,Se,Ce,$,we.z,null)}}let ue=T.children;for(let Se=0,Ce=ue.length;Se<Ce;Se++)ou(ue[Se],k,$,K)}function Xd(T,k,$,K){let H=T.opaque,ue=T.transmissive,Se=T.transparent;p.setupLightsView($),fe===!0&&ae.setGlobalState(y.clippingPlanes,$),K&&re.viewport(P.copy(K)),H.length>0&&Io(H,k,$),ue.length>0&&Io(ue,k,$),Se.length>0&&Io(Se,k,$),re.buffers.depth.setTest(!0),re.buffers.depth.setMask(!0),re.buffers.color.setMask(!0),re.setPolygonOffset(!1)}function Yd(T,k,$,K){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[K.id]===void 0&&(p.state.transmissionRenderTarget[K.id]=new Vt(1,1,{generateMipmaps:!0,type:ze.has("EXT_color_buffer_half_float")||ze.has("EXT_color_buffer_float")?Ut:Fn,minFilter:Sn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));let ue=p.state.transmissionRenderTarget[K.id],Se=K.viewport||P;ue.setSize(Se.z*y.transmissionResolutionScale,Se.w*y.transmissionResolutionScale);let Ce=y.getRenderTarget(),Te=y.getActiveCubeFace(),He=y.getActiveMipmapLevel();y.setRenderTarget(ue),y.getClearColor(z),V=y.getClearAlpha(),V<1&&y.setClearColor(16777215,.5),y.clear(),Oe&&ye.render($);let Ge=y.toneMapping;y.toneMapping=Vi;let Fe=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),p.setupLightsView(K),fe===!0&&ae.setGlobalState(y.clippingPlanes,K),Io(T,$,K),Pe.updateMultisampleRenderTarget(ue),Pe.updateRenderTargetMipmap(ue),ze.has("WEBGL_multisampled_render_to_texture")===!1){let nt=!1;for(let _t=0,Pt=k.length;_t<Pt;_t++){let Mt=k[_t],xt=Mt.object,ke=Mt.geometry,Tt=Mt.material,ct=Mt.group;if(Tt.side===Mn&&xt.layers.test(K.layers)){let Rn=Tt.side;Tt.side=Jt,Tt.needsUpdate=!0,$d(xt,$,K,ke,Tt,ct),Tt.side=Rn,Tt.needsUpdate=!0,nt=!0}}nt===!0&&(Pe.updateMultisampleRenderTarget(ue),Pe.updateRenderTargetMipmap(ue))}y.setRenderTarget(Ce,Te,He),y.setClearColor(z,V),Fe!==void 0&&(K.viewport=Fe),y.toneMapping=Ge}function Io(T,k,$){let K=k.isScene===!0?k.overrideMaterial:null;for(let H=0,ue=T.length;H<ue;H++){let Se=T[H],Ce=Se.object,Te=Se.geometry,He=Se.group,Ge=Se.material;Ge.allowOverride===!0&&K!==null&&(Ge=K),Ce.layers.test($.layers)&&$d(Ce,k,$,Te,Ge,He)}}function $d(T,k,$,K,H,ue){T.onBeforeRender(y,k,$,K,H,ue),T.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),H.onBeforeRender(y,k,$,K,T,ue),H.transparent===!0&&H.side===Mn&&H.forceSinglePass===!1?(H.side=Jt,H.needsUpdate=!0,y.renderBufferDirect($,k,K,H,T,ue),H.side=ni,H.needsUpdate=!0,y.renderBufferDirect($,k,K,H,T,ue),H.side=Mn):y.renderBufferDirect($,k,K,H,T,ue),T.onAfterRender(y,k,$,K,H,ue)}function Do(T,k,$){k.isScene!==!0&&(k=_e);let K=he.get(T),H=p.state.lights,ue=p.state.shadowsArray,Se=H.state.version,Ce=J.getParameters(T,H.state,ue,k,$),Te=J.getProgramCacheKey(Ce),He=K.programs;K.environment=T.isMeshStandardMaterial?k.environment:null,K.fog=k.fog,K.envMap=(T.isMeshStandardMaterial?Je:$e).get(T.envMap||K.environment),K.envMapRotation=K.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,He===void 0&&(T.addEventListener("dispose",X),He=new Map,K.programs=He);let Ge=He.get(Te);if(Ge!==void 0){if(K.currentProgram===Ge&&K.lightsStateVersion===Se)return Kd(T,Ce),Ge}else Ce.uniforms=J.getUniforms(T),T.onBeforeCompile(Ce,y),Ge=J.acquireProgram(Ce,Te),He.set(Te,Ge),K.uniforms=Ce.uniforms;let Fe=K.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Fe.clippingPlanes=ae.uniform),Kd(T,Ce),K.needsLights=Pg(T),K.lightsStateVersion=Se,K.needsLights&&(Fe.ambientLightColor.value=H.state.ambient,Fe.lightProbe.value=H.state.probe,Fe.directionalLights.value=H.state.directional,Fe.directionalLightShadows.value=H.state.directionalShadow,Fe.spotLights.value=H.state.spot,Fe.spotLightShadows.value=H.state.spotShadow,Fe.rectAreaLights.value=H.state.rectArea,Fe.ltc_1.value=H.state.rectAreaLTC1,Fe.ltc_2.value=H.state.rectAreaLTC2,Fe.pointLights.value=H.state.point,Fe.pointLightShadows.value=H.state.pointShadow,Fe.hemisphereLights.value=H.state.hemi,Fe.directionalShadowMap.value=H.state.directionalShadowMap,Fe.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Fe.spotShadowMap.value=H.state.spotShadowMap,Fe.spotLightMatrix.value=H.state.spotLightMatrix,Fe.spotLightMap.value=H.state.spotLightMap,Fe.pointShadowMap.value=H.state.pointShadowMap,Fe.pointShadowMatrix.value=H.state.pointShadowMatrix),K.currentProgram=Ge,K.uniformsList=null,Ge}function Zd(T){if(T.uniformsList===null){let k=T.currentProgram.getUniforms();T.uniformsList=Gr.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function Kd(T,k){let $=he.get(T);$.outputColorSpace=k.outputColorSpace,$.batching=k.batching,$.batchingColor=k.batchingColor,$.instancing=k.instancing,$.instancingColor=k.instancingColor,$.instancingMorph=k.instancingMorph,$.skinning=k.skinning,$.morphTargets=k.morphTargets,$.morphNormals=k.morphNormals,$.morphColors=k.morphColors,$.morphTargetsCount=k.morphTargetsCount,$.numClippingPlanes=k.numClippingPlanes,$.numIntersection=k.numClipIntersection,$.vertexAlphas=k.vertexAlphas,$.vertexTangents=k.vertexTangents,$.toneMapping=k.toneMapping}function Rg(T,k,$,K,H){k.isScene!==!0&&(k=_e),Pe.resetTextureUnits();let ue=k.fog,Se=K.isMeshStandardMaterial?k.environment:null,Ce=R===null?y.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:Ht,Te=(K.isMeshStandardMaterial?Je:$e).get(K.envMap||Se),He=K.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,Ge=!!$.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Fe=!!$.morphAttributes.position,nt=!!$.morphAttributes.normal,_t=!!$.morphAttributes.color,Pt=Vi;K.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(Pt=y.toneMapping);let Mt=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,xt=Mt!==void 0?Mt.length:0,ke=he.get(K),Tt=p.state.lights;if(fe===!0&&(q===!0||T!==M)){let pn=T===M&&K.id===S;ae.setState(K,T,pn)}let ct=!1;K.version===ke.__version?(ke.needsLights&&ke.lightsStateVersion!==Tt.state.version||ke.outputColorSpace!==Ce||H.isBatchedMesh&&ke.batching===!1||!H.isBatchedMesh&&ke.batching===!0||H.isBatchedMesh&&ke.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&ke.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&ke.instancing===!1||!H.isInstancedMesh&&ke.instancing===!0||H.isSkinnedMesh&&ke.skinning===!1||!H.isSkinnedMesh&&ke.skinning===!0||H.isInstancedMesh&&ke.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&ke.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&ke.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&ke.instancingMorph===!1&&H.morphTexture!==null||ke.envMap!==Te||K.fog===!0&&ke.fog!==ue||ke.numClippingPlanes!==void 0&&(ke.numClippingPlanes!==ae.numPlanes||ke.numIntersection!==ae.numIntersection)||ke.vertexAlphas!==He||ke.vertexTangents!==Ge||ke.morphTargets!==Fe||ke.morphNormals!==nt||ke.morphColors!==_t||ke.toneMapping!==Pt||ke.morphTargetsCount!==xt)&&(ct=!0):(ct=!0,ke.__version=K.version);let Rn=ke.currentProgram;ct===!0&&(Rn=Do(K,k,H));let Js=!1,Cn=!1,ta=!1,At=Rn.getUniforms(),Hn=ke.uniforms;if(re.useProgram(Rn.program)&&(Js=!0,Cn=!0,ta=!0),K.id!==S&&(S=K.id,Cn=!0),Js||M!==T){re.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),At.setValue(U,"projectionMatrix",T.projectionMatrix),At.setValue(U,"viewMatrix",T.matrixWorldInverse);let xn=At.map.cameraPosition;xn!==void 0&&xn.setValue(U,me.setFromMatrixPosition(T.matrixWorld)),Y.logarithmicDepthBuffer&&At.setValue(U,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&At.setValue(U,"isOrthographic",T.isOrthographicCamera===!0),M!==T&&(M=T,Cn=!0,ta=!0)}if(H.isSkinnedMesh){At.setOptional(U,H,"bindMatrix"),At.setOptional(U,H,"bindMatrixInverse");let pn=H.skeleton;pn&&(pn.boneTexture===null&&pn.computeBoneTexture(),At.setValue(U,"boneTexture",pn.boneTexture,Pe))}H.isBatchedMesh&&(At.setOptional(U,H,"batchingTexture"),At.setValue(U,"batchingTexture",H._matricesTexture,Pe),At.setOptional(U,H,"batchingIdTexture"),At.setValue(U,"batchingIdTexture",H._indirectTexture,Pe),At.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&At.setValue(U,"batchingColorTexture",H._colorsTexture,Pe));let Vn=$.morphAttributes;if((Vn.position!==void 0||Vn.normal!==void 0||Vn.color!==void 0)&&se.update(H,$,Rn),(Cn||ke.receiveShadow!==H.receiveShadow)&&(ke.receiveShadow=H.receiveShadow,At.setValue(U,"receiveShadow",H.receiveShadow)),K.isMeshGouraudMaterial&&K.envMap!==null&&(Hn.envMap.value=Te,Hn.flipEnvMap.value=Te.isCubeTexture&&Te.isRenderTargetTexture===!1?-1:1),K.isMeshStandardMaterial&&K.envMap===null&&k.environment!==null&&(Hn.envMapIntensity.value=k.environmentIntensity),Cn&&(At.setValue(U,"toneMappingExposure",y.toneMappingExposure),ke.needsLights&&Cg(Hn,ta),ue&&K.fog===!0&&te.refreshFogUniforms(Hn,ue),te.refreshMaterialUniforms(Hn,K,G,ie,p.state.transmissionRenderTarget[T.id]),Gr.upload(U,Zd(ke),Hn,Pe)),K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Gr.upload(U,Zd(ke),Hn,Pe),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&At.setValue(U,"center",H.center),At.setValue(U,"modelViewMatrix",H.modelViewMatrix),At.setValue(U,"normalMatrix",H.normalMatrix),At.setValue(U,"modelMatrix",H.matrixWorld),K.isShaderMaterial||K.isRawShaderMaterial){let pn=K.uniformsGroups;for(let xn=0,lu=pn.length;xn<lu;xn++){let ys=pn[xn];Ue.update(ys,Rn),Ue.bind(ys,Rn)}}return Rn}function Cg(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function Pg(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(T,k,$){let K=he.get(T);K.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),he.get(T.texture).__webglTexture=k,he.get(T.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:$,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,k){let $=he.get(T);$.__webglFramebuffer=k,$.__useDefaultFramebuffer=k===void 0};let Ig=U.createFramebuffer();this.setRenderTarget=function(T,k=0,$=0){R=T,A=k,I=$;let K=!0,H=null,ue=!1,Se=!1;if(T){let Te=he.get(T);if(Te.__useDefaultFramebuffer!==void 0)re.bindFramebuffer(U.FRAMEBUFFER,null),K=!1;else if(Te.__webglFramebuffer===void 0)Pe.setupRenderTarget(T);else if(Te.__hasExternalTextures)Pe.rebindTextures(T,he.get(T.texture).__webglTexture,he.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Fe=T.depthTexture;if(Te.__boundDepthTexture!==Fe){if(Fe!==null&&he.has(Fe)&&(T.width!==Fe.image.width||T.height!==Fe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Pe.setupDepthRenderbuffer(T)}}let He=T.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Se=!0);let Ge=he.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ge[k])?H=Ge[k][$]:H=Ge[k],ue=!0):T.samples>0&&Pe.useMultisampledRTT(T)===!1?H=he.get(T).__webglMultisampledFramebuffer:Array.isArray(Ge)?H=Ge[$]:H=Ge,P.copy(T.viewport),L.copy(T.scissor),N=T.scissorTest}else P.copy(Me).multiplyScalar(G).floor(),L.copy(Ae).multiplyScalar(G).floor(),N=Ne;if($!==0&&(H=Ig),re.bindFramebuffer(U.FRAMEBUFFER,H)&&K&&re.drawBuffers(T,H),re.viewport(P),re.scissor(L),re.setScissorTest(N),ue){let Te=he.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+k,Te.__webglTexture,$)}else if(Se){let Te=k;for(let He=0;He<T.textures.length;He++){let Ge=he.get(T.textures[He]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+He,Ge.__webglTexture,$,Te)}}else if(T!==null&&$!==0){let Te=he.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Te.__webglTexture,$)}S=-1},this.readRenderTargetPixels=function(T,k,$,K,H,ue,Se,Ce=0){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=he.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Se!==void 0&&(Te=Te[Se]),Te){re.bindFramebuffer(U.FRAMEBUFFER,Te);try{let He=T.textures[Ce],Ge=He.format,Fe=He.type;if(!Y.textureFormatReadable(Ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Y.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-K&&$>=0&&$<=T.height-H&&(T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ce),U.readPixels(k,$,K,H,Ee.convert(Ge),Ee.convert(Fe),ue))}finally{let He=R!==null?he.get(R).__webglFramebuffer:null;re.bindFramebuffer(U.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(T,k,$,K,H,ue,Se,Ce=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=he.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Se!==void 0&&(Te=Te[Se]),Te)if(k>=0&&k<=T.width-K&&$>=0&&$<=T.height-H){re.bindFramebuffer(U.FRAMEBUFFER,Te);let He=T.textures[Ce],Ge=He.format,Fe=He.type;if(!Y.textureFormatReadable(Ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Y.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let nt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,nt),U.bufferData(U.PIXEL_PACK_BUFFER,ue.byteLength,U.STREAM_READ),T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ce),U.readPixels(k,$,K,H,Ee.convert(Ge),Ee.convert(Fe),0);let _t=R!==null?he.get(R).__webglFramebuffer:null;re.bindFramebuffer(U.FRAMEBUFFER,_t);let Pt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Dp(U,Pt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,nt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ue),U.deleteBuffer(nt),U.deleteSync(Pt),ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,k=null,$=0){let K=Math.pow(2,-$),H=Math.floor(T.image.width*K),ue=Math.floor(T.image.height*K),Se=k!==null?k.x:0,Ce=k!==null?k.y:0;Pe.setTexture2D(T,0),U.copyTexSubImage2D(U.TEXTURE_2D,$,0,0,Se,Ce,H,ue),re.unbindTexture()};let Dg=U.createFramebuffer(),Lg=U.createFramebuffer();this.copyTextureToTexture=function(T,k,$=null,K=null,H=0,ue=null){ue===null&&(H!==0?(xr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ue=H,H=0):ue=0);let Se,Ce,Te,He,Ge,Fe,nt,_t,Pt,Mt=T.isCompressedTexture?T.mipmaps[ue]:T.image;if($!==null)Se=$.max.x-$.min.x,Ce=$.max.y-$.min.y,Te=$.isBox3?$.max.z-$.min.z:1,He=$.min.x,Ge=$.min.y,Fe=$.isBox3?$.min.z:0;else{let Vn=Math.pow(2,-H);Se=Math.floor(Mt.width*Vn),Ce=Math.floor(Mt.height*Vn),T.isDataArrayTexture?Te=Mt.depth:T.isData3DTexture?Te=Math.floor(Mt.depth*Vn):Te=1,He=0,Ge=0,Fe=0}K!==null?(nt=K.x,_t=K.y,Pt=K.z):(nt=0,_t=0,Pt=0);let xt=Ee.convert(k.format),ke=Ee.convert(k.type),Tt;k.isData3DTexture?(Pe.setTexture3D(k,0),Tt=U.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(Pe.setTexture2DArray(k,0),Tt=U.TEXTURE_2D_ARRAY):(Pe.setTexture2D(k,0),Tt=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,k.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,k.unpackAlignment);let ct=U.getParameter(U.UNPACK_ROW_LENGTH),Rn=U.getParameter(U.UNPACK_IMAGE_HEIGHT),Js=U.getParameter(U.UNPACK_SKIP_PIXELS),Cn=U.getParameter(U.UNPACK_SKIP_ROWS),ta=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,He),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ge),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Fe);let At=T.isDataArrayTexture||T.isData3DTexture,Hn=k.isDataArrayTexture||k.isData3DTexture;if(T.isDepthTexture){let Vn=he.get(T),pn=he.get(k),xn=he.get(Vn.__renderTarget),lu=he.get(pn.__renderTarget);re.bindFramebuffer(U.READ_FRAMEBUFFER,xn.__webglFramebuffer),re.bindFramebuffer(U.DRAW_FRAMEBUFFER,lu.__webglFramebuffer);for(let ys=0;ys<Te;ys++)At&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,he.get(T).__webglTexture,H,Fe+ys),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,he.get(k).__webglTexture,ue,Pt+ys)),U.blitFramebuffer(He,Ge,Se,Ce,nt,_t,Se,Ce,U.DEPTH_BUFFER_BIT,U.NEAREST);re.bindFramebuffer(U.READ_FRAMEBUFFER,null),re.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||T.isRenderTargetTexture||he.has(T)){let Vn=he.get(T),pn=he.get(k);re.bindFramebuffer(U.READ_FRAMEBUFFER,Dg),re.bindFramebuffer(U.DRAW_FRAMEBUFFER,Lg);for(let xn=0;xn<Te;xn++)At?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Vn.__webglTexture,H,Fe+xn):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Vn.__webglTexture,H),Hn?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,pn.__webglTexture,ue,Pt+xn):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,pn.__webglTexture,ue),H!==0?U.blitFramebuffer(He,Ge,Se,Ce,nt,_t,Se,Ce,U.COLOR_BUFFER_BIT,U.NEAREST):Hn?U.copyTexSubImage3D(Tt,ue,nt,_t,Pt+xn,He,Ge,Se,Ce):U.copyTexSubImage2D(Tt,ue,nt,_t,He,Ge,Se,Ce);re.bindFramebuffer(U.READ_FRAMEBUFFER,null),re.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Hn?T.isDataTexture||T.isData3DTexture?U.texSubImage3D(Tt,ue,nt,_t,Pt,Se,Ce,Te,xt,ke,Mt.data):k.isCompressedArrayTexture?U.compressedTexSubImage3D(Tt,ue,nt,_t,Pt,Se,Ce,Te,xt,Mt.data):U.texSubImage3D(Tt,ue,nt,_t,Pt,Se,Ce,Te,xt,ke,Mt):T.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ue,nt,_t,Se,Ce,xt,ke,Mt.data):T.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ue,nt,_t,Mt.width,Mt.height,xt,Mt.data):U.texSubImage2D(U.TEXTURE_2D,ue,nt,_t,Se,Ce,xt,ke,Mt);U.pixelStorei(U.UNPACK_ROW_LENGTH,ct),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Rn),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Js),U.pixelStorei(U.UNPACK_SKIP_ROWS,Cn),U.pixelStorei(U.UNPACK_SKIP_IMAGES,ta),ue===0&&k.generateMipmaps&&U.generateMipmap(Tt),re.unbindTexture()},this.initRenderTarget=function(T){he.get(T).__webglFramebuffer===void 0&&Pe.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Pe.setTextureCube(T,0):T.isData3DTexture?Pe.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Pe.setTexture2DArray(T,0):Pe.setTexture2D(T,0),re.unbindTexture()},this.resetState=function(){A=0,I=0,R=null,re.reset(),de.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}};var pm={type:"change"},Xh={type:"start"},gm={type:"end"},Dc=new hi,mm=new an,Hv=Math.cos(70*ft.DEG2RAD),Xt=new C,En=2*Math.PI,yt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},qh=1e-6,Lc=class extends Ka{constructor(e,t=null){super(e,t),this.state=yt.NONE,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Un.ROTATE,MIDDLE:Un.DOLLY,RIGHT:Un.PAN},this.touches={ONE:Nn.ROTATE,TWO:Nn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new Kt,this._lastTargetPosition=new C,this._quat=new Kt().setFromUnitVectors(e.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Nr,this._sphericalDelta=new Nr,this._scale=1,this._panOffset=new C,this._rotateStart=new ce,this._rotateEnd=new ce,this._rotateDelta=new ce,this._panStart=new ce,this._panEnd=new ce,this._panDelta=new ce,this._dollyStart=new ce,this._dollyEnd=new ce,this._dollyDelta=new ce,this._dollyDirection=new C,this._mouse=new ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Gv.bind(this),this._onPointerDown=Vv.bind(this),this._onPointerUp=Wv.bind(this),this._onContextMenu=Kv.bind(this),this._onMouseWheel=Xv.bind(this),this._onKeyDown=Yv.bind(this),this._onTouchStart=$v.bind(this),this._onTouchMove=Zv.bind(this),this._onMouseDown=jv.bind(this),this._onMouseMove=qv.bind(this),this._interceptControlDown=Jv.bind(this),this._interceptControlUp=Qv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(pm),this.update(),this.state=yt.NONE}update(e=null){let t=this.object.position;Xt.copy(t).sub(this.target),Xt.applyQuaternion(this._quat),this._spherical.setFromVector3(Xt),this.autoRotate&&this.state===yt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=En:n>Math.PI&&(n-=En),s<-Math.PI?s+=En:s>Math.PI&&(s-=En),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Xt.setFromSpherical(this._spherical),Xt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Xt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Xt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new C(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Xt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Dc.origin.copy(this.object.position),Dc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Dc.direction))<Hv?this.object.lookAt(this.target):(mm.setFromNormalAndCoplanarPoint(this.object.up,this.target),Dc.intersectPlane(mm,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>qh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>qh||this._lastTargetPosition.distanceToSquared(this.target)>qh?(this.dispatchEvent(pm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?En/60*this.autoRotateSpeed*e:En/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Xt.setFromMatrixColumn(t,0),Xt.multiplyScalar(-e),this._panOffset.add(Xt)}_panUp(e,t){this.screenSpacePanning===!0?Xt.setFromMatrixColumn(t,1):(Xt.setFromMatrixColumn(t,0),Xt.crossVectors(this.object.up,Xt)),Xt.multiplyScalar(e),this._panOffset.add(Xt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Xt.copy(s).sub(this.target);let r=Xt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ce,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Vv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function Gv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Wv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(gm),this.state=yt.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function jv(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Un.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=yt.DOLLY;break;case Un.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=yt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=yt.ROTATE}break;case Un.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=yt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=yt.PAN}break;default:this.state=yt.NONE}this.state!==yt.NONE&&this.dispatchEvent(Xh)}function qv(i){switch(this.state){case yt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case yt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case yt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Xv(i){this.enabled===!1||this.enableZoom===!1||this.state!==yt.NONE||(i.preventDefault(),this.dispatchEvent(Xh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(gm))}function Yv(i){this.enabled!==!1&&this._handleKeyDown(i)}function $v(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Nn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=yt.TOUCH_ROTATE;break;case Nn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=yt.TOUCH_PAN;break;default:this.state=yt.NONE}break;case 2:switch(this.touches.TWO){case Nn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=yt.TOUCH_DOLLY_PAN;break;case Nn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=yt.TOUCH_DOLLY_ROTATE;break;default:this.state=yt.NONE}break;default:this.state=yt.NONE}this.state!==yt.NONE&&this.dispatchEvent(Xh)}function Zv(i){switch(this._trackPointer(i),this.state){case yt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case yt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case yt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case yt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=yt.NONE}}function Kv(i){this.enabled!==!1&&i.preventDefault()}function Jv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Qv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Uc=class extends Lc{constructor(e,t,{reducedMotion:n=()=>!1}={}){super(e,t),this.enableDamping=!0,this.motionTime=70,this.zoomTime=85,this.reducedMotion=n,this.getMaxZoomDistance=()=>this.maxDistance,this._zoomGoal=null,this._frameTime=null,this._zoomOffset=new C,this._scheduled=!0}update(){return this._scheduled?(this.dispatchEvent({type:"wake"}),!1):super.update()}sync(){return super.update()}rest(){this._frameTime=null}stopMotion(){this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0),this._scale=1,this._zoomGoal=null,this.rest()}clearBlockedPan(e){for(let t of["x","y","z"])Math.abs(e[t])>1e-8&&(this._panOffset[t]=0)}zoomBy(e){if(!Number.isFinite(e)||e<=0)return;let t=this.getDistance(),n=this._zoomGoal!==null&&(e-1)*(this._zoomGoal-t)<0;this._zoomGoal=ft.clamp((n?t:this._zoomGoal??t)*e,this.minDistance,this.getMaxZoomDistance()),this.update()}_dollyIn(e){this.zoomBy(e)}_dollyOut(e){this.zoomBy(1/e)}step(e=performance.now()){let t=this._frameTime===null?16.666666666666668:Math.max(0,e-this._frameTime);this._frameTime=e;let n=Math.min(64,t),s=this.reducedMotion();if(this.dampingFactor=s?1:-Math.expm1(-n/this.motionTime),this._zoomGoal!==null){this._zoomGoal=ft.clamp(this._zoomGoal,this.minDistance,this.getMaxZoomDistance());let o=this.getDistance(),l=s?1:-Math.expm1(-n/this.zoomTime),c=Math.exp(ft.lerp(Math.log(o),Math.log(this._zoomGoal),l));Math.abs(c-this._zoomGoal)<.001&&(c=this._zoomGoal,this._zoomGoal=null),this._zoomOffset.copy(this.object.position).sub(this.target).setLength(c),this.object.position.copy(this.target).add(this._zoomOffset)}let r=super.update(n/1e3),a=this.getPolarAngle();return(a<=this.minPolarAngle+1e-6&&this._sphericalDelta.phi<0||a>=this.maxPolarAngle-1e-6&&this._sphericalDelta.phi>0)&&(this._sphericalDelta.phi=0),r}};function Nc(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new gt,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let m=0;m<f.count;++m)h.push(f.getX(m)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in r){let h=_m(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in a){let h=a[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let _=0;_<a[u].length;++_)f.push(a[u][_][d]);let m=_m(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function _m(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*t}let a=new e(r),o=new ut(a,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let d=0,f=u.count;d<f;d++)for(let m=0;m<t;m++){let _=u.getComponent(d,m);o.setComponent(d+h,m,_)}}else a.set(u.array,l);l+=u.count*t}return s!==void 0&&(o.gpuType=s),o}function Yh(i,e){if(e===vh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===kr||e===ao){let t=i.getIndex();if(t===null){let a=[],o=i.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);i.setIndex(a),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===kr)for(let a=1;a<=n;a++)s.push(t.getX(0)),s.push(t.getX(a)),s.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(s.push(t.getX(a)),s.push(t.getX(a+1)),s.push(t.getX(a+2))):(s.push(t.getX(a+2)),s.push(t.getX(a+1)),s.push(t.getX(a)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var Fc=class extends si{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new td(t)}),this.register(function(t){return new nd(t)}),this.register(function(t){return new hd(t)}),this.register(function(t){return new dd(t)}),this.register(function(t){return new fd(t)}),this.register(function(t){return new sd(t)}),this.register(function(t){return new rd(t)}),this.register(function(t){return new ad(t)}),this.register(function(t){return new od(t)}),this.register(function(t){return new ed(t)}),this.register(function(t){return new ld(t)}),this.register(function(t){return new id(t)}),this.register(function(t){return new ud(t)}),this.register(function(t){return new cd(t)}),this.register(function(t){return new Jh(t)}),this.register(function(t){return new pd(t)}),this.register(function(t){return new md(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=Hi.extractUrlBase(e);a=Hi.resolveURL(c,this.path)}else a=Hi.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ns(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(u){t(u),r.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Mm){try{a[tt.KHR_BINARY_GLTF]=new gd(e)}catch(h){s&&s(h);return}r=JSON.parse(a[tt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Sd(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[h.name]=h,a[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],d=r.extensionsRequired||[];switch(h){case tt.KHR_MATERIALS_UNLIT:a[h]=new Qh;break;case tt.KHR_DRACO_MESH_COMPRESSION:a[h]=new _d(r,this.dracoLoader);break;case tt.KHR_TEXTURE_TRANSFORM:a[h]=new yd;break;case tt.KHR_MESH_QUANTIZATION:a[h]=new xd;break;default:d.indexOf(h)>=0&&o[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function eb(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var tt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Jh=class{constructor(e){this.parser=e,this.name=tt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,u=new Ie(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],Ht);let h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new zs(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Ya(u),c.distance=h;break;case"spot":c=new Xa(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),xi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},Qh=class{constructor(){this.name=tt.KHR_MATERIALS_UNLIT}getMaterialType(){return Gt}extendParams(e,t,n){let s=[];e.color=new Ie(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Ht),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Rt))}return Promise.all(s)}},ed=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},td=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ce(o,o)}return Promise.all(r)}},nd=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},id=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}},sd=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new Ie(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=s.extensions[this.name];if(a.sheenColorFactor!==void 0){let o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Ht)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,Rt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}},rd=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}},ad=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Ie().setRGB(o[0],o[1],o[2],Ht),Promise.all(r)}},od=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},ld=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new Ie().setRGB(o[0],o[1],o[2],Ht),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,Rt)),Promise.all(r)}},cd=class{constructor(e){this.parser=e,this.name=tt.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}},ud=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:on}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],a=s.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}},hd=class{constructor(e){this.parser=e,this.name=tt.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},dd=class{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},fd=class{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},pd=class{constructor(e){this.name=tt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,u=s.count,h=s.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,h,d,s.mode,s.filter).then(function(f){return f.buffer}):a.ready.then(function(){let f=new ArrayBuffer(u*h);return a.decodeGltfBuffer(new Uint8Array(f),u,h,d,s.mode,s.filter),f})})}else return null}},md=class{constructor(e){this.name=tt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==qn.TRIANGLES&&c.mode!==qn.TRIANGLE_STRIP&&c.mode!==qn.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(u=>(l[c]=u,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let u=c.pop(),h=u.isGroup?u.children:[u],d=c[0].count,f=[];for(let m of h){let _=new Re,g=new C,p=new Kt,b=new C(1,1,1),x=new wa(m.geometry,m.material,d);for(let y=0;y<d;y++)l.TRANSLATION&&g.fromBufferAttribute(l.TRANSLATION,y),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,y),l.SCALE&&b.fromBufferAttribute(l.SCALE,y),x.setMatrixAt(y,_.compose(g,p,b));for(let y in l)if(y==="_COLOR_0"){let E=l[y];x.instanceColor=new ns(E.array,E.itemSize,E.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&m.geometry.setAttribute(y,l[y]);Et.prototype.copy.call(x,m),this.parser.assignFinalMaterial(x),f.push(x)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},Mm="glTF",lo=12,ym={JSON:1313821514,BIN:5130562},gd=class{constructor(e){this.name=tt.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,lo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Mm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-lo,r=new DataView(e,lo),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===ym.JSON){let c=new Uint8Array(e,lo+a,o);this.content=n.decode(c)}else if(l===ym.BIN){let c=lo+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},_d=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=tt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let u in a){let h=bd[u]||u.toLowerCase();o[h]=a[u]}for(let u in e.attributes){let h=bd[u]||u.toLowerCase();if(a[u]!==void 0){let d=n.accessors[e.attributes[u]],f=qr[d.componentType];c[h]=f.name,l[h]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,d){s.decodeDracoFile(u,function(f){for(let m in f.attributes){let _=f.attributes[m],g=l[m];g!==void 0&&(_.normalized=g)}h(f)},o,c,Ht,d)})})}},yd=class{constructor(){this.name=tt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},xd=class{constructor(){this.name=tt.KHR_MESH_QUANTIZATION}},Oc=class extends Oi{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,u=s-t,h=(n-t)/u,d=h*h,f=d*h,m=e*c,_=m-c,g=-2*f+3*d,p=f-d,b=1-g,x=p-d+h;for(let y=0;y!==o;y++){let E=a[_+y+o],A=a[_+y+l]*u,I=a[m+y+o],R=a[m+y]*u;r[y]=b*E+x*A+g*I+p*R}return r}},tb=new Kt,vd=class extends Oc{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return tb.fromArray(r).normalize().toArray(r),r}},qn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},qr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},xm={9728:Ft,9729:Lt,9984:Wl,9985:zr,9986:Gs,9987:Sn},vm={33071:Wn,33648:gr,10497:kt},$h={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},bd={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},os={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},nb={CUBICSPLINE:void 0,LINEAR:As,STEP:Ts},Zh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function ib(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Wt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ni})),i.DefaultMaterial}function $s(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function xi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function sb(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,u=e.length;c<u;c++){let h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,u=e.length;c<u;c++){let h=e[c];if(n){let d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;a.push(d)}if(s){let d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;o.push(d)}if(r){let d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let u=c[0],h=c[1],d=c[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function rb(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function ab(i){let e,t=i.extensions&&i.extensions[tt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Kh(t.attributes):e=i.indices+":"+Kh(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Kh(i.targets[n]);return e}function Kh(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Md(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function ob(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var lb=new Re,Sd=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new eb,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?this.textureLoader=new Fs(this.options.manager):this.textureLoader=new $a(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ns(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return $s(r,o,s),xi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,u]of a.children.entries())r(u,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[tt.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(Hi.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=$h[s.type],o=qr[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new ut(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=$h[s.type],c=qr[s.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,m=s.normalized===!0,_,g;if(f&&f!==h){let p=Math.floor(d/f),b="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,x=t.cache.get(b);x||(_=new c(o,p*f,s.count*f/u),x=new Tr(_,f/u),t.cache.add(b,x)),g=new Ar(x,l,d%f/u,m)}else o===null?_=new c(s.count*l):_=new c(o,d,s.count*l),g=new ut(_,l,m);if(s.sparse!==void 0){let p=$h.SCALAR,b=qr[s.sparse.indices.componentType],x=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,E=new b(a[1],x,s.sparse.count*p),A=new c(a[2],y,s.sparse.count*l);o!==null&&(g=new ut(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let I=0,R=E.length;I<R;I++){let S=E[I];if(g.setX(S,A[I*l]),l>=2&&g.setY(S,A[I*l+1]),l>=3&&g.setZ(S,A[I*l+2]),l>=4&&g.setW(S,A[I*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);let d=(r.samplers||{})[a.sampler]||{};return u.magFilter=xm[d.magFilter]||Lt,u.minFilter=xm[d.minFilter]||Sn,u.wrapS=vm[d.wrapS]||kt,u.wrapT=vm[d.wrapT]||kt,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Ft&&u.minFilter!==Lt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(h){c=!0;let d=new Blob([h],{type:a.mimeType});return l=o.createObjectURL(d),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(l).then(function(h){return new Promise(function(d,f){let m=d;t.isImageBitmapLoader===!0&&(m=function(_){let g=new $t(_);g.needsUpdate=!0,d(g)}),t.load(Hi.resolveURL(h,r.path),m,void 0,f)})}).then(function(h){return c===!0&&o.revokeObjectURL(l),xi(h,a),h.userData.mimeType=a.mimeType||ob(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[tt.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[tt.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[tt.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Cr,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new fi,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Wt}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[tt.KHR_MATERIALS_UNLIT]){let h=s[tt.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),c.push(h.extendParams(o,r,t))}else{let h=r.pbrMetallicRoughness||{};if(o.color=new Ie(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Ht),o.opacity=d[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",h.baseColorTexture,Rt)),o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=Mn);let u=r.alphaMode||Zh.OPAQUE;if(u===Zh.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===Zh.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Gt&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new ce(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;o.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&a!==Gt&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Gt){let h=r.emissiveFactor;o.emissive=new Ie().setRGB(h[0],h[1],h[2],Ht)}return r.emissiveTexture!==void 0&&a!==Gt&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Rt)),Promise.all(c).then(function(){let h=new a(o);return r.name&&(h.name=r.name),xi(h,r),t.associations.set(h,{materials:e}),r.extensions&&$s(s,h,r),h})}createUniqueName(e){let t=vt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[tt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return bm(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],u=ab(c),h=s[u];if(h)a.push(h.promise);else{let d;c.extensions&&c.extensions[tt.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=bm(new gt,c,t),s[u]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let u=a[l].material===void 0?ib(this.cache):this.getDependency("material",a[l].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let f=0,m=u.length;f<m;f++){let _=u[f],g=a[f],p,b=c[f];if(g.mode===qn.TRIANGLES||g.mode===qn.TRIANGLE_STRIP||g.mode===qn.TRIANGLE_FAN||g.mode===void 0)p=r.isSkinnedMesh===!0?new Ma(_,b):new it(_,b),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),g.mode===qn.TRIANGLE_STRIP?p.geometry=Yh(p.geometry,ao):g.mode===qn.TRIANGLE_FAN&&(p.geometry=Yh(p.geometry,kr));else if(g.mode===qn.LINES)p=new Ni(_,b);else if(g.mode===qn.LINE_STRIP)p=new Ps(_,b);else if(g.mode===qn.LINE_LOOP)p=new Ea(_,b);else if(g.mode===qn.POINTS)p=new Ta(_,b);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(p.geometry.morphAttributes).length>0&&rb(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),xi(p,r),g.extensions&&$s(s,p,g),t.assignFinalMaterial(p),h.push(p)}for(let f=0,m=h.length;f<m;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return r.extensions&&$s(s,h[0],r),h[0];let d=new Dt;r.extensions&&$s(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,m=h.length;f<m;f++)d.add(h[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new It(ft.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new ki(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),xi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,u=a.length;c<u;c++){let h=a[c];if(h){o.push(h);let d=new Re;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Sa(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],u=[];for(let h=0,d=s.channels.length;h<d;h++){let f=s.channels[h],m=s.samplers[f.sampler],_=f.target,g=_.node,p=s.parameters!==void 0?s.parameters[m.input]:m.input,b=s.parameters!==void 0?s.parameters[m.output]:m.output;_.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",b)),c.push(m),u.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],m=h[2],_=h[3],g=h[4],p=[];for(let x=0,y=d.length;x<y;x++){let E=d[x],A=f[x],I=m[x],R=_[x],S=g[x];if(E===void 0)continue;E.updateMatrix&&E.updateMatrix();let M=n._createAnimationTracks(E,A,I,R,S);if(M)for(let P=0;P<M.length;P++)p.push(M[P])}let b=new Ga(r,void 0,p);return xi(b,s),b})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,u=o.length;c<u;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let u=c[0],h=c[1],d=c[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,lb)});for(let f=0,m=h.length;f<m;f++)u.add(h[f]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let u;if(r.isBone===!0?u=new Rr:c.length>1?u=new Dt:c.length===1?u=c[0]:u=new Et,u!==c[0])for(let h=0,d=c.length;h<d;h++)u.add(c[h]);if(r.name&&(u.userData.name=r.name,u.name=a),xi(u,r),r.extensions&&$s(n,u,r),r.matrix!==void 0){let h=new Re;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let h=s.associations.get(u);s.associations.set(u,{...h})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Dt;n.name&&(r.name=s.createUniqueName(n.name)),xi(r,n),n.extensions&&$s(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let u=0,h=l.length;u<h;u++)r.add(l[u]);let c=u=>{let h=new Map;for(let[d,f]of s.associations)(d instanceof gn||d instanceof $t)&&h.set(d,f);return u.traverse(d=>{let f=s.associations.get(d);f!=null&&h.set(d,f)}),h};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];os[r.path]===os.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(o);let c;switch(os[r.path]){case os.weights:c=pi;break;case os.rotation:c=mi;break;case os.translation:case os.scale:c=gi;break;default:switch(n.itemSize){case 1:c=pi;break;case 2:case 3:default:c=gi;break}break}let u=s.interpolation!==void 0?nb[s.interpolation]:As,h=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){let m=new c(l[d]+"."+os[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Md(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof mi?vd:Oc;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function cb(i,e,t){let n=e.attributes,s=new Ot;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new C(l[0],l[1],l[2]),new C(c[0],c[1],c[2])),o.normalized){let u=Md(qr[o.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new C,l=new C;for(let c=0,u=r.length;c<u;c++){let h=r[c];if(h.POSITION!==void 0){let d=t.json.accessors[h.POSITION],f=d.min,m=d.max;if(f!==void 0&&m!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(m[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(m[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(m[2]))),d.normalized){let _=Md(qr[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new vn;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function bm(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=bd[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return Qe.workingColorSpace!==Ht&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Qe.workingColorSpace}" not supported.`),xi(i,e),cb(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?sb(i,e.targets,t):i})}function Sm(i={now:()=>performance.now(),request:t=>requestAnimationFrame(t),cancel:t=>cancelAnimationFrame(t),delay:(t,n)=>setTimeout(t,n),clear:t=>clearTimeout(t),foreground:()=>document.visibilityState==="visible"&&document.hasFocus(),subscribe:t=>{let n=()=>t(!1),s=()=>t(document.visibilityState==="visible"&&document.hasFocus());return window.addEventListener("blur",n),document.addEventListener("visibilitychange",s),()=>{window.removeEventListener("blur",n),document.removeEventListener("visibilitychange",s)}}},e=5e3){if(!Number.isFinite(e)||e<5e3||e>6e4)throw new RangeError("Frame sampling duration must be between 5000 and 60000 ms");return new Promise(t=>{let n=[],s=i.now(),r=120,a=e+5e3,o=null,l=null,c=null,u=!1,h=i.foreground(),d=0,f=i.subscribe(p=>{p||(h=!1,d++)});function m(p){if(u)return;u=!0,i.clear(g),c!==null&&i.cancel(c),f();let b=[...n].sort((E,A)=>E-A),x=l===null?0:o-l,y=E=>b.length?+b[Math.min(b.length-1,Math.floor(b.length*E))].toFixed(2):null;t({schemaVersion:2,sampleCount:n.length,requestedSamples:r,minimumDurationMs:e,timeoutMs:a,elapsedMs:Math.round(i.now()-s),sampleDurationMs:+x.toFixed(2),medianMs:y(.5),p95Ms:y(.95),maxMs:y(1),averageFps:x?+(n.length*1e3/x).toFixed(2):null,intervalsOver50Ms:n.filter(E=>E>50).length,intervalsOver100Ms:n.filter(E=>E>100).length,intervalsMs:n.map(E=>+E.toFixed(3)),continuouslyForeground:h,foregroundInterruptions:d,timedOut:p,valid:n.length>=r&&x>=e&&h&&!p,method:`Consecutive requestAnimationFrame intervals for at least ${e/1e3} seconds and 120 samples; no long frames discarded; ${a/1e3}-second timeout. Browser callback timing, not GPU-only render cost.`})}function _(p){h=h&&i.foreground(),l===null&&(l=p),o!==null&&n.push(p-o),o=p,n.length>=r&&p-l>=e?m(!1):c=i.request(_)}let g=i.delay(()=>m(!0),a);c=i.request(_)})}function wm({render:i,onIdle:e=()=>{},onError:t=r=>{throw r},request:n=r=>requestAnimationFrame(r),cancel:s=r=>cancelAnimationFrame(r)}){let r=null,a=!1,o=!1,l=!1,c=!1;function u(){!c&&!a&&r===null&&(r=n(d))}function h(){c||(o=!0,u())}function d(f){r=null,a=!0,o=!1;let m=!1;try{m=!!i(f)}catch(_){c=!0,l=!1,o=!1,t(_)}finally{a=!1}c||(l||o||m?u():e())}return{invalidate:h,setContinuous(f){c||(l=!!f,l&&h())},get idle(){return!a&&r===null&&!l},dispose(){c=!0,l=!1,o=!1,r!==null&&s(r),r=null}}}function Em(i,e){let t=e.position.clone(),n=e.quaternion.clone(),s=i.target.clone(),r=!1;return{get updating(){return r},update(a){t.copy(e.position),n.copy(e.quaternion),s.copy(i.target);let o=e.zoom;r=!0;try{i.step?i.step(a):i.update()}finally{r=!1}return t.distanceToSquared(e.position)>1e-12||s.distanceToSquared(i.target)>1e-12||n.angleTo(e.quaternion)>1e-6||Math.abs(o-e.zoom)>1e-9}}}async function Tm(i,e={now:()=>performance.now(),delay:n=>new Promise(s=>setTimeout(s,n)),foreground:()=>document.visibilityState==="visible"&&document.hasFocus(),subscribe:n=>{let s=()=>n(!1),r=()=>n(document.visibilityState==="visible"&&document.hasFocus());return window.addEventListener("blur",s),document.addEventListener("visibilitychange",r),()=>{window.removeEventListener("blur",s),document.removeEventListener("visibilitychange",r)}}},t=2e3){let n=e.now(),s=e.foreground(),r=0,a=e.subscribe(o=>{o||(s=!1,r++)});try{for(;!i().idle&&e.now()-n<5e3;)await e.delay(50);let o=i(),l=e.now();o.idle&&await e.delay(t);let c=i(),u=e.now()-l;s=s&&e.foreground();let h=o.idle&&s&&u>=t,d=c.renderedFrames-o.renderedFrames;return{method:"Wait up to 5 seconds for demand rendering to settle, then observe actual renderer.render calls for at least 2 seconds. No animation callbacks requested by this audit.",minimumDurationMs:t,settleElapsedMs:+(l-n).toFixed(2),elapsedMs:+u.toFixed(2),before:o,after:c,drawsDuringIdle:d,continuouslyForeground:s,foregroundInterruptions:r,valid:h,status:h?d===0&&c.idle?"PASS":"FAIL":"INCONCLUSIVE"}}finally{a()}}var zc="S1.214",ub=new Set(["building","building_detail","d6_screen"]),Am=new WeakMap;function ls(i){for(let e=i;e;e=e.parent)if(e.userData.id||e.userData.kind)return e.userData;return{}}function Rm(i){let e=i.object.userData.triangleFeatures;if(!e){let s=ls(i.object);if(s.kind!=="building_batch")return s;let r=i.object.geometry,a=r?.getAttribute("_bnbu_id"),o=s.building_index_ids,l=i.faceIndex;if(!a||!Array.isArray(o)||!Number.isInteger(l)||l<0)return{};let c=l*3,u=r.index?.count??r.attributes.position.count;if(c+2>=u)return{};let h=[0,1,2].map(m=>r.index?r.index.getX(c+m):c+m),d=a.getX(h[0]);if(!Number.isInteger(d)||d<1||d>o.length||!h.every(m=>a.getX(m)===d))return{};let f=Am.get(i.object);return f||(f=new Map,Am.set(i.object,f)),f.has(d)||f.set(d,{kind:"building",id:o[d-1],phase:s.phase,lod:s.lod,construction_status:s.construction_status,building_id_source:"_BNBU_ID"}),f.get(d)}if(!Number.isInteger(i.faceIndex)||i.faceIndex<0)return{};let t=0,n=e.length-1;for(;t<=n;){let s=t+n>>1,r=e[s];if(i.faceIndex<r.firstTriangle)n=s-1;else if(i.faceIndex>=r.firstTriangle+r.triangleCount)t=s+1;else return r.feature}return{}}function wd(i){return(i.index?.count??i.attributes.position.count)/3}function hb(i,e){let t=i.geometry;return ub.has(e.kind)&&(e.id||e.building_id)&&!i.isSkinnedMesh&&!i.isInstancedMesh&&!Array.isArray(i.material)&&!i.material.transparent&&!Object.keys(t.morphAttributes).length&&t.drawRange.start===0&&t.drawRange.count===1/0&&t.groups.length===0&&i.matrixWorld.determinant()>0&&Number.isInteger(wd(t))}function Cm(i){i.updateMatrixWorld(!0);let e=new Dt;e.name=i.name;let t=new Map,n=0,s=0,r=0;i.traverse(o=>{if(!o.isMesh)return;n++,s+=wd(o.geometry);let l=ls(o);if(!hb(o,l)){let h=o.clone(!1);h.matrix.copy(o.matrixWorld),h.matrixAutoUpdate=!1,h.userData={...l,...o.userData},e.add(h);return}let c=Object.entries(o.geometry.attributes).map(([h,d])=>[h,d.itemSize,d.normalized,d.array.constructor.name]).sort(),u=JSON.stringify([l.phase,l.construction_status,l.height_status,o.material.uuid,!!o.geometry.index,c,o.renderOrder,o.layers.mask]);t.has(u)||t.set(u,[]),t.get(u).push({object:o,feature:l}),r++});let a=0;for(let o of t.values()){let l=o.map(({object:m})=>m.geometry.clone().applyMatrix4(m.matrixWorld)),c=Nc(l,!1);if(!c)throw Error("Campus batch has incompatible vertex attributes");let u=o[0],h=new it(c,u.object.material);h.name=`Campus runtime ${u.feature.phase} ${u.feature.height_status} ${u.object.material.name}`,h.renderOrder=u.object.renderOrder,h.layers.mask=u.object.layers.mask;let d=0,f=o.map(({feature:m},_)=>{let g=wd(l[_]),p={firstTriangle:d,triangleCount:g,feature:m};return d+=g,p});h.userData={kind:"building_runtime_batch",phase:u.feature.phase,height_status:u.feature.height_status,construction_status:u.feature.construction_status,triangleFeatures:f},c.computeBoundingBox(),c.computeBoundingSphere(),l.forEach(m=>m.dispose()),a+=d,e.add(h)}return e.userData.runtimeBatching={version:zc,inputMeshes:n,outputMeshes:e.children.length,batchInputMeshes:r,batchOutputMeshes:t.size,inputTriangles:s,batchedTriangles:a,featureRanges:[...e.children].reduce((o,l)=>o+(l.userData.triangleFeatures?.length??0),0)},e}async function Pm(i,e,t,n){let s=new Set,r=new Set;i.traverse(c=>{if(!c.isMesh)return;let u=e.get(c),h=u?.normalMap;if(!h)return;r.add(h);let d=c.userData.triangleFeatures?.map(f=>f.feature)||[ls(c)];for(let f of d)s.add(f.id)});let a=[];for(let c of r){let u=c.image,h=document.createElement("canvas");h.width=u.width,h.height=u.height;let d=h.getContext("2d",{willReadFrequently:!0});d.drawImage(u,0,0);let f=d.getImageData(0,0,u.width,u.height).data,m=[...new Uint8Array(await crypto.subtle.digest("SHA-256",f))].map(_=>_.toString(16).padStart(2,"0")).join("");a.push({width:u.width,height:u.height,rgbaSha256:m,noColorConversion:c.colorSpace===On,repeat:c.wrapS===kt&&c.wrapT===kt})}let o=t<2?n.building_ids:[],l=[...s].sort();return{pass:JSON.stringify(l)===JSON.stringify(o)&&a.length===(t<2?1:0)&&a.every(c=>c.width===128&&c.height===128&&c.rgbaSha256===n.image.rgba_sha256&&c.noColorConversion&&c.repeat),texturedBuildingIds:l,images:a,physicalMaterialMeasured:!1}}var Ed=[1.8,.65,.24];function Td(i,e=null){let t=e??Ed.filter(n=>i<n).length;for(;t<3&&i<Ed[t]*.9;)t++;for(;t>0&&i>Ed[t-1]*1.1;)t--;return t}function Im(i){let e=i.display_name||i.name||"",t=i.tags||{};return/学习资源|图书馆|体育馆|大学会堂|高等研究院|会同古村/.test(e)||["town","village","suburb"].includes(t.place)?0:i.kind!=="poi"?1:t.emergency||["bench","bicycle_parking","waste_disposal","waste_basket","recycling","parking_entrance"].includes(t.amenity)||/停车场入口|垃圾|消防栓|失物招领/.test(e)||/^(出入口|入口|道闸)$/.test(e)?3:i.category==="entrance"||t.natural==="water"||t.water||["park","garden"].includes(t.leisure)||/中心湖|大碧池/.test(e)?1:i.category==="office"||["facility","other"].includes(i.category)?3:2}function Dm(i,e,{selected:t=!1,focused:n=!1}={}){return t?"selected":n?"name":e===0?i===0?"name":"hidden":e===1?i<=1?"name":i===2?"icon":"hidden":i<=e?"name":"hidden"}function Ad(i,e,t){let n=Math.max(.45,Math.min(1.35,e*t/85e4));return Math.round([12,22,32,42][i]*n)}function Lm(i){let e=i.tags||{};return i.kind!=="poi"?"building":i.road||e.highway==="road"?"road":e.natural==="water"||e.water||/中心湖|大碧池/.test(i.name)?"water":{dining:"dining",shop:"shop",transport:"bus",health:"medical",facility:"pin",office:"building",leisure:"leaf",culture:"culture",entrance:"gate"}[i.category]||"pin"}var Rd=[["all","\u5168\u90E8"],["learning","\u6559\u5B66"],["residence","\u4F4F\u5BBF"],["culture","\u6587\u5316"],["sport","\u8FD0\u52A8"],["service","\u5176\u4ED6"]];function Bc(i){let e=i.display_name||i.name;return/^[VD]\d+\b/.test(e)?"residence":/^T\d+\b|学习资源|研究院/.test(e)?"learning":/体育|运动/.test(e)?"sport":/会堂|演艺|文化/.test(e)?"culture":"service"}var Um=i=>String(i||"").normalize("NFKC").toLowerCase().replace(/\s+/g,"");function db(i,{query:e="",category:t="all",phase:n="all",construction:s=!0}={}){let r=String(e).trim().split(/\s+/).map(Um).filter(Boolean);return i.filter(a=>{if(n!=="all"&&a.phase!==n||!s&&a.construction_status==="construction_unverified"||t!=="all"&&Bc(a)!==t)return!1;let o=/学习资源中心/.test(a.name)?"\u56FE\u4E66\u9986 library tushuguan tsg":"",l=Rd.find(([u])=>u===Bc(a))[1],c=Um(`${pu(a)} ${l} ${o} ${a.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"}`);return r.every(u=>c.includes(u))})}function Nm({buildings:i,places:e=[],camera:t,controls:n,stage:s,choose:r,invalidate:a,getState:o,onScopeChange:l=()=>{}}){let c=Y=>document.querySelector(Y),u=c("#building-search"),h=c("#search-results"),d=c("#map-labels"),f="all",m="buildings",_="",g=null,p=i,b=-1,x="",y=30,E=[...i,...e.filter(Y=>!i.some(re=>re.id===Y.id))],A=new Set,I=new Set,R=[],S=!0,M=[],P=null,L=c("#show-labels"),N=c("#scale-bar"),z=c("#scale-bar i"),V=c("#scale-text"),B=[...document.querySelectorAll("header,.explore,.detail,.map-tools,.view-dock,.render-studio,.qa,footer,.map-hint")],ie=()=>{S=!0,a()},G=new ResizeObserver(ie);B.forEach(Y=>G.observe(Y)),G.observe(s);let oe=new MutationObserver(ie);B.forEach(Y=>oe.observe(Y,{attributes:!0,attributeFilter:["hidden","class"]})),window.addEventListener("resize",ie);let le=new Map(E.map(Y=>[Y.id,new C(Y.centroid[0],Y.kind==="poi"?Y.labelHeight:Y.base_elevation_m+(Y.display_height_m??Y.height_m)+3,-Y.centroid[1])])),Me=document.createElement("canvas").getContext("2d");Me.font="600 14px "+getComputedStyle(d).fontFamily;let Ae=E.filter(Y=>!/^未命名/.test(Y.name)).map(Y=>{let re=document.createElement("button");re.className="map-label",re.hidden=!0;let Be=Y.display_name||Y.name,he=Im(Y),Pe=document.createElement("span");Pe.className="map-label-symbol",Pe.append(Qs(Lm(Y)));let $e=document.createElement("span");$e.className="map-label-text",$e.textContent=Be,re.append(Pe,$e),re.title=`${Y.nearby?"\u5468\u8FB9":Y.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${Be}${Y.floor?" \xB7 "+Y.floor+"\u5C42":""}`,re.dataset.placeId=Y.id,re.dataset.rank=he,re.setAttribute("aria-label",`\u5B9A\u4F4D${re.title}`),re.dataset.category=Y.kind==="poi"?Y.category:Bc(Y),Y.kind==="poi"&&re.classList.add("place-label"),re.addEventListener("click",()=>r(Y)),d.appendChild(re);let Je=Math.min(202,Math.ceil(Me.measureText(Be).width)+37);return{b:Y,button:re,point:le.get(Y.id),width:Je,rank:he}});function Ne(){c("#building-categories").replaceChildren();for(let[Y,re]of m!=="buildings"?li:Rd){let Be=document.createElement("button");Be.textContent=re,Be.dataset.category=Y,Be.setAttribute("aria-pressed",String(Y===f)),Be.addEventListener("click",()=>{f=Y,x="",y=30,fe()}),c("#building-categories").appendChild(Be)}}function Ve(Y){m=Y,f="all",_="",x="",y=30,g=null,c("#place-floor").value="",c(".explore").classList.remove("has-selection"),document.querySelectorAll("[data-search-scope]").forEach(re=>re.setAttribute("aria-pressed",String(re.dataset.searchScope===m))),l(m),Ne(),fe()}document.querySelectorAll("[data-search-scope]").forEach(Y=>Y.addEventListener("click",()=>Ve(Y.dataset.searchScope))),c("#place-floor").addEventListener("change",()=>{_=c("#place-floor").value,fe()}),c("#place-type").addEventListener("change",()=>{x=c("#place-type").value,y=30,fe()}),c("#clear-within").addEventListener("click",()=>{g=null,fe()}),Ne();function fe(){let Y=o(),re=db(i,{query:u.value,category:m==="buildings"?f:"all",phase:Y.view,construction:Y.construction}),Be=m==="buildings"&&!!u.value.trim()&&Y.view==="all",he=af(e.filter(v=>Be||(m==="nearby"?v.nearby:!v.nearby)),{query:u.value,category:m!=="buildings"?f:"all",phase:m==="nearby"||Be?"all":Y.view,floor:_,position:Y.location});Y.placeCategories&&(he=he.filter(v=>Y.placeCategories.has(v.category))),g&&(he=he.filter(v=>v.building_id===g));let Pe=c("#place-type");Pe.replaceChildren(new Option("\u5168\u90E8\u7C7B\u578B",""));let $e=[...new Set(he.map(v=>qi(v.tags)))];for(let v of $e)Pe.add(new Option(`${Zn[v]} \xB7 ${he.filter(F=>qi(F.tags)===v).length}`,v));x&&!$e.includes(x)&&(x=""),Pe.value=x,x&&(he=he.filter(v=>qi(v.tags)===x)),p=m!=="buildings"?he:u.value.trim()&&f==="all"?[...re,...he.filter(v=>!re.some(F=>F.id===v.id))]:re,Y.location&&p.sort((v,F)=>Math.hypot(v.centroid[0]-Y.location[0],v.centroid[1]-Y.location[1])-Math.hypot(F.centroid[0]-Y.location[0],F.centroid[1]-Y.location[1])),Y.favoritesOnly&&(p=p.filter(v=>Y.favorites?.has(v.id))),A=new Set(p.map(v=>v.id)),I=hf(e,Y,{query:u.value,scope:m,category:f}),R=[...Ae].sort((v,F)=>v.rank-F.rank||+(v.b.kind==="poi")-+(F.b.kind==="poi")||v.b.id.localeCompare(F.b.id)),c("#clear-search").hidden=!u.value,c("#building-categories").querySelectorAll("button").forEach(v=>v.setAttribute("aria-pressed",String(v.dataset.category===f)));let Je=!!(u.value.trim()||f!=="all"||m!=="buildings"||Y.favoritesOnly);h.hidden=!Je,b=-1;let D=e.filter(v=>!v.nearby&&!i.some(F=>F.id===v.id)&&(Y.view==="all"||v.phase===Y.view));if(c("#search-summary").textContent=Je?`${p.length} \u5904\u7ED3\u679C \xB7 ${Y.location?"\u6309\u76F4\u7EBF\u8DDD\u79BB\u6392\u5E8F":"\u70B9\u51FB\u5B9A\u4F4D"}`:`${p.length} \u680B\u5EFA\u7B51 \xB7 ${D.length} \u5904\u6821\u56ED\u5730\u70B9`,c("#place-filters").hidden=m==="buildings",c("#place-floor-field").hidden=m!=="places",c("#place-type-field").hidden=m==="buildings",c("#clear-within").hidden=!g,h.replaceChildren(),Je&&!p.length){let v=document.createElement("p");v.textContent="\u6CA1\u6709\u5339\u914D\u7684\u5730\u70B9\uFF0C\u53EF\u5C1D\u8BD5\u697C\u53F7\u3001\u4E2D\u6587\u3001\u82F1\u6587\u6216\u62FC\u97F3\uFF0C\u4E5F\u53EF\u8C03\u6574\u7C7B\u522B\u4E0E\u697C\u5C42\u3002",h.appendChild(v)}if(Je)for(let v of p.slice(0,y)){let F=document.createElement("button");F.className="search-result";let J=document.createElement("span");J.textContent=v.display_name||v.name;let te=document.createElement("small"),W=v.kind==="poi"?li.find(([ye])=>ye===v.category)[1]:Rd.find(([ye])=>ye===Bc(v))[1],ge=Y.location?`${Math.round(Math.hypot(v.centroid[0]-Y.location[0],v.centroid[1]-Y.location[1]))}m \xB7 `:"";te.textContent=`${ge}${v.nearby?"\u5468\u8FB9":v.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${W}${v.building_name&&!/^未命名/.test(v.building_name)?" \xB7 "+v.building_name:""}${v.floor?" \xB7 "+v.floor+"\u5C42":""}`;let ae=document.createElement("span");ae.className="result-symbol",ae.append(Qs(v.kind==="poi"?"pin":"building"));let xe=document.createElement("span");xe.className="result-copy",xe.append(J,te),F.append(ae,xe,Qs("arrow")),F.addEventListener("click",()=>r(v)),h.appendChild(F)}if(Je&&p.length>y){let v=document.createElement("button");v.className="wide-action",v.textContent=`\u518D\u663E\u793A ${Math.min(30,p.length-y)} \u5904 \xB7 \u4F59 ${p.length-y} \u5904`,v.onclick=()=>{let F=h.scrollTop;y+=30,fe(),h.scrollTop=F},h.appendChild(v)}ie()}u.addEventListener("input",()=>{y=30,c(".explore").classList.remove("has-selection"),fe()}),c("#clear-search").addEventListener("click",()=>{c(".explore").classList.remove("has-selection"),u.value="",fe(),u.focus()}),u.addEventListener("keydown",Y=>{let re=[...h.querySelectorAll("button")];if(Y.key==="Escape"){u.value="",f="all",fe();return}re.length&&((Y.key==="ArrowDown"||Y.key==="ArrowUp")&&(Y.preventDefault(),b=(b+(Y.key==="ArrowDown"?1:-1)+re.length)%re.length,re.forEach((Be,he)=>Be.classList.toggle("keyboard-active",he===b)),re[b].scrollIntoView({block:"nearest"})),Y.key==="Enter"&&(Y.preventDefault(),re[Math.max(0,b)].click()))}),c("#show-labels").addEventListener("change",a),c(".display-settings").addEventListener("toggle",ie),c("#qa-tools").addEventListener("toggle",ie);let q=new C,Z=new C,me=new C,we=new an(new C(0,1,0),0),_e=new Bs,Oe=new C,dt=new C,U=new ce(-.1,0),lt=new ce(.1,0);function ze(){let Y=o(),re=s.clientWidth,Be=s.clientHeight;S&&(M=B.filter(te=>!te.hidden).map(te=>te.getBoundingClientRect()),S=!1);let he=[];t.getWorldDirection(Z);let Pe=t.position.distanceTo(n.target),$e=2*Math.tan(t.fov*Math.PI/360)/Be;P=Td(Pe*$e,P),d.dataset.zoomLevel=["overview","campus","local","detail"][P];let Je=new URLSearchParams(location.search).get("surface")==="explore"?Math.min(Ad(P,re,Be),(re<760?[5,8,12,16]:[8,12,18,24])[P]):Ad(P,re,Be),D=!!(u.value.trim()||f!=="all"||x||_||g||Y.favoritesOnly),v=Y.selected?[...R.filter(te=>te.b.id===Y.selected),...R.filter(te=>te.b.id!==Y.selected)]:R;for(let{b:te,button:W,point:ge,width:ae,rank:xe}of v){let ye=()=>{W.hidden||(W.hidden=!0)},se=te.id===Y.selected;if(te.nearby&&!Y.surroundingsEnabled){ye();continue}if(!L.checked||!A.has(te.id)&&!I.has(te.id)&&!se||Y.labels===!1){ye();continue}if(I.has(te.id)&&!se&&Math.hypot(ge.x-n.target.x,ge.z-n.target.z)>Math.max(250,Pe*1.1)){ye();continue}me.copy(ge).sub(t.position);let pe=me.dot(Z);if(pe<=0){ye();continue}let Le=Math.min(P,Td(pe*$e,P)),Ee=Dm(xe,Le,{selected:se,focused:D&&A.has(te.id)});if(Ee==="hidden"||!se&&he.length>=Je){ye();continue}if(q.copy(ge).project(t),q.z<-1||q.z>1){ye();continue}let de=(q.x+1)*re/2,Ue=(1-q.y)*Be/2,w=se?34:28,O=Ee==="icon"?28:ae+(se?15:0),j={left:de-O/2,right:de+O/2,top:Ue-w-8,bottom:Ue-8};if(j.left<8||j.right>re-8||j.top<8||j.bottom>Be-8){ye();continue}let ee={...j,bottom:se?Ue:j.bottom},ne=se?9:P<2?12:7,X=De=>ee.left<De.right+ne&&ee.right>De.left-ne&&ee.top<De.bottom+ne&&ee.bottom>De.top-ne;if(M.some(X)||he.some(X)){ye();continue}he.push(ee),W.hidden&&(W.hidden=!1),W.classList.toggle("selected",se),W.setAttribute("aria-pressed",String(se)),W.dataset.labelMode!==Ee&&(W.dataset.labelMode=Ee),W.style.width=`${O}px`,W.style.height=`${w}px`;let be=`translate3d(${(de-O/2).toFixed(2)}px,${(Ue-w-8).toFixed(2)}px,0)`;W.style.transform!==be&&(W.style.transform=be)}_e.setFromCamera(U,t);let F=_e.ray.intersectPlane(we,Oe);_e.setFromCamera(lt,t);let J=_e.ray.intersectPlane(we,dt);if(N.hidden=!F||!J,F&&J){let te=F.distanceTo(J)/(.1*re),W=te*90,ge=10**Math.floor(Math.log10(W)),ae=[1,2,5,10].map(se=>se*ge).filter(se=>se<=W).pop()||ge,xe=`${(ae/te).toFixed(1)}px`,ye=`\u7EA6 ${ae>=1e3?`${ae/1e3} km`:`${ae} m`}`;z.style.width!==xe&&(z.style.width=xe),V.textContent!==ye&&(V.textContent=ye)}}return fe(),{refresh:fe,update:ze,setScope:Ve,showInside(Y){Ve("places"),g=Y,u.value="",fe()},get scope(){return m}}}function Fm({camera:i,controls:e,invalidate:t,reducedMotion:n=()=>matchMedia("(prefers-reduced-motion: reduce)").matches}){let s=null;function r(){s=null}e.addEventListener("start",r);function a(c,u,h=!0){if(e.stopMotion)e.stopMotion();else{let d=i.position.clone(),f=e.target.clone(),m=e.enableDamping;e.enableDamping=!1,e.update(),i.position.copy(d),e.target.copy(f),e.update(),e.enableDamping=m}if(!h||n()){s=null,i.position.copy(c),e.target.copy(u),o(),t();return}s={from:i.position.clone(),to:c.clone(),fromTarget:e.target.clone(),toTarget:u.clone(),start:performance.now(),duration:620},t()}function o(){e.sync?e.sync():e.update()}function l(c){if(!s)return!1;let u=Math.min(1,Math.max(0,(c-s.start)/s.duration)),h=u*u*(3-2*u);return i.position.lerpVectors(s.from,s.to,h),e.target.lerpVectors(s.fromTarget,s.toTarget,h),o(),u===1&&(s=null),!!s}return{move:a,update:l,cancel:r,get active(){return!!s}}}function Om(i,e){let t=null,n=6500,s=new C,r=new C,a=new C;return e.minDistance=45,e.maxDistance=6500,e.minPolarAngle=0,e.maxPolarAngle=ft.degToRad(78),e.screenSpacePanning=!1,{setRegion(o,l){t={minX:o[0]-120,maxX:o[2]+120,minZ:-o[3]-120,maxZ:-o[1]+120},n=Math.min(6500,Math.max(900,l*1.6))},constrain(){if(!t)return;s.copy(e.target),e.target.x=ft.clamp(e.target.x,t.minX,t.maxX),e.target.y=ft.clamp(e.target.y,0,80),e.target.z=ft.clamp(e.target.z,t.minZ,t.maxZ),r.copy(e.target).sub(s),i.position.add(r),e.clearBlockedPan?.(r),a.copy(i.position).sub(e.target);let o=a.length(),l=ft.clamp(o,e.minDistance,n);o>0&&Math.abs(o-l)>1e-8&&i.position.copy(e.target).addScaledVector(a,l/o),i.updateMatrixWorld()},get maxDistance(){return n},get bounds(){return t?{...t}:null}}}function Cd(i,e){let t=e==="pan";i.mouseButtons.LEFT=t?Un.PAN:Un.ROTATE,i.mouseButtons.RIGHT=t?Un.ROTATE:Un.PAN,i.touches.ONE=t?Nn.PAN:Nn.ROTATE,i.touches.TWO=t?Nn.DOLLY_ROTATE:Nn.DOLLY_PAN}var Qt=class i extends it{constructor(e,t={}){super(e),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this.camera=new It;let n=this,s=t.color!==void 0?new Ie(t.color):new Ie(8355711),r=t.textureWidth||512,a=t.textureHeight||512,o=t.clipBias||0,l=t.shader||i.ReflectorShader,c=t.multisample!==void 0?t.multisample:4,u=new an,h=new C,d=new C,f=new C,m=new Re,_=new C(0,0,-1),g=new st,p=new C,b=new C,x=new st,y=new Re,E=this.camera,A=new Vt(r,a,{samples:c,type:Ut}),I=new St({name:l.name!==void 0?l.name:"unspecified",uniforms:un.clone(l.uniforms),fragmentShader:l.fragmentShader,vertexShader:l.vertexShader});I.uniforms.tDiffuse.value=A.texture,I.uniforms.color.value=s,I.uniforms.textureMatrix.value=y,this.material=I,this.onBeforeRender=function(R,S,M){if(d.setFromMatrixPosition(n.matrixWorld),f.setFromMatrixPosition(M.matrixWorld),m.extractRotation(n.matrixWorld),h.set(0,0,1),h.applyMatrix4(m),p.subVectors(d,f),p.dot(h)>0===!0&&this.forceUpdate===!1)return;p.reflect(h).negate(),p.add(d),m.extractRotation(M.matrixWorld),_.set(0,0,-1),_.applyMatrix4(m),_.add(f),b.subVectors(d,_),b.reflect(h).negate(),b.add(d),E.position.copy(p),E.up.set(0,1,0),E.up.applyMatrix4(m),E.up.reflect(h),E.lookAt(b),E.far=M.far,E.updateMatrixWorld(),E.projectionMatrix.copy(M.projectionMatrix),y.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),y.multiply(E.projectionMatrix),y.multiply(E.matrixWorldInverse),y.multiply(n.matrixWorld),u.setFromNormalAndCoplanarPoint(h,d),u.applyMatrix4(E.matrixWorldInverse),g.set(u.normal.x,u.normal.y,u.normal.z,u.constant);let L=E.projectionMatrix;x.x=(Math.sign(g.x)+L.elements[8])/L.elements[0],x.y=(Math.sign(g.y)+L.elements[9])/L.elements[5],x.z=-1,x.w=(1+L.elements[10])/L.elements[14],g.multiplyScalar(2/g.dot(x)),L.elements[2]=g.x,L.elements[6]=g.y,L.elements[10]=g.z+1-o,L.elements[14]=g.w,n.visible=!1;let N=R.getRenderTarget(),z=R.xr.enabled,V=R.shadowMap.autoUpdate;R.xr.enabled=!1,R.shadowMap.autoUpdate=!1,R.setRenderTarget(A),R.state.buffers.depth.setMask(!0),R.autoClear===!1&&R.clear(),R.render(S,E),R.xr.enabled=z,R.shadowMap.autoUpdate=V,R.setRenderTarget(N);let B=M.viewport;B!==void 0&&R.state.viewport(B),n.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return A},this.dispose=function(){A.dispose(),n.material.dispose()}}};Qt.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
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

    }`};var cs={campusGroundMap:{value:null},campusGroundMatrix:{value:new Re},campusGroundAvailable:{value:0}},zm=`
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
`;function Bm({renderer:i,scene:e,camera:t}){let n=new Qt(new Fi(1,1),{textureWidth:1024,textureHeight:1024,multisample:0,clipBias:1e-4});n.rotation.x=-Math.PI/2,n.position.y=.12,n.updateMatrixWorld(!0);let s=n.getRenderTarget();s.texture.generateMipmaps=!0,s.texture.minFilter=Sn,cs.campusGroundMap.value=s.texture;let r=!0,a=!1,o=0,l=new Re,c=new Re;return{invalidate(){r=!0},prepare({moving:u,quality:h,strength:d,wetness:f}){if(cs.campusGroundAvailable.value=0,!(h==="balanced"||d<=0||f<=0||t.position.y<.3)){if(!u&&(r||!l.equals(t.matrixWorld)||!c.equals(t.projectionMatrix))){let m=[];e.traverse(b=>{b.visible&&(b.isReflector||b.isLine||b.isLineSegments)&&(m.push(b),b.visible=!1)});let _=i.getRenderTarget(),g=i.xr.enabled,p=i.shadowMap.autoUpdate;try{cs.campusGroundMap.value=null,n.onBeforeRender(i,e,t),cs.campusGroundMatrix.value.copy(n.material.uniforms.textureMatrix.value).multiply(n.matrixWorld.clone().invert()),l.copy(t.matrixWorld),c.copy(t.projectionMatrix),a=!0,r=!1,o++}finally{cs.campusGroundMap.value=s.texture,m.forEach(b=>b.visible=!0),i.setRenderTarget(_),i.xr.enabled=g,i.shadowMap.autoUpdate=p}}cs.campusGroundAvailable.value=a?Math.min(1,d):0}},get diagnostics(){return{updates:o,resolution:1024,scenePassesPerCapture:1,mode:"rough planar ground with environment fallback",geometryModified:!1}}}}var co={clear:{label:"\u6674\u5929",cloud:0,sun:1,ambient:1,fog:0,color:13952237},cloudy:{label:"\u591A\u4E91",cloud:.75,sun:.32,ambient:1.65,fog:9e-5,color:12897747},rain:{label:"\u96E8\u5929",cloud:1,sun:.12,ambient:1.5,fog:22e-5,color:10728640},mist:{label:"\u8584\u96FE",cloud:.5,sun:.5,ambient:1.5,fog:65e-5,color:14082016}};function km({scene:i,camera:e,controls:t,visuals:n,invalidate:s}){let a=new Float32Array(10800),o=new Float32Array(1800*3);for(let x=0;x<o.length;x++)o[x]=Math.random();let l=new gt;l.setAttribute("position",new ut(a,3).setUsage(Mh));let c=new fi({color:13034226,transparent:!0,opacity:.46,depthWrite:!1}),u=new Ni(l,c);u.name="Simulated rainfall",u.frustumCulled=!1,u.visible=!1,u.raycast=()=>{},i.add(u);let h=document.querySelector("#weather"),d=document.querySelector("#weather-motion"),f=document.querySelector("#weather-note"),m=matchMedia("(prefers-reduced-motion: reduce)");d.checked=!m.matches;let _="clear",g=0,p=null;try{let x=localStorage.getItem("campus-weather");Object.hasOwn(co,x)&&(_=x)}catch{}function b(){h.value=_,u.visible=_==="rain",d.disabled=_!=="rain",f.textContent=`${co[_].label} \xB7 \u6A21\u62DF\u6548\u679C${_==="rain"&&!d.checked?" \xB7 \u96E8\u4E1D\u5DF2\u6682\u505C":""}`,n.setWeather(_),p=null;try{localStorage.setItem("campus-weather",_)}catch{}s()}return h.addEventListener("change",()=>{_=h.value,b()}),d.addEventListener("change",b),m.addEventListener("change",()=>{d.checked=!m.matches,b()}),document.addEventListener("visibilitychange",()=>{p=null,s()}),b(),{update(x,y=!1){let E=_==="rain"&&d.checked&&!document.hidden&&!y;if(E&&p!==null&&(g+=Math.min(.05,Math.max(0,(x-p)/1e3))),p=E?x:null,_!=="rain")return!1;let A=ft.clamp(e.position.distanceTo(t.target)*1.4,150,6500),I=A*.65;for(let R=0;R<1800;R++){let S=R*3,M=R*6,P=((o[S+1]-g*.3)%1+1)%1,L=t.target.x+(o[S]-.5)*A,N=t.target.z+(o[S+2]-.5)*A;a[M]=L,a[M+1]=4+P*I,a[M+2]=N,a[M+3]=L-A*.0018,a[M+4]=a[M+1]+A*.009,a[M+5]=N}return l.attributes.position.needsUpdate=!0,E},get mode(){return _}}}var uo=class i extends it{constructor(){let e=i.SkyShader,t=new St({name:e.name,uniforms:un.clone(e.uniforms),vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,side:Jt,depthWrite:!1});super(new ts(1,1,1),t),this.isSky=!0}};uo.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new C},up:{value:new C(0,1,0)}},vertexShader:`
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

    }`};var kc=class extends Wa{constructor(e){super(e),this.type=Ut}parse(e){let a=function(R,S){switch(R){case 1:throw new Error("THREE.HDRLoader: Read Error: "+(S||""));case 2:throw new Error("THREE.HDRLoader: Write Error: "+(S||""));case 3:throw new Error("THREE.HDRLoader: Bad File Format: "+(S||""));default:case 4:throw new Error("THREE.HDRLoader: Memory Error: "+(S||""))}},h=function(R,S,M){S=S||1024;let L=R.pos,N=-1,z=0,V="",B=String.fromCharCode.apply(null,new Uint16Array(R.subarray(L,L+128)));for(;0>(N=B.indexOf(`
`))&&z<S&&L<R.byteLength;)V+=B,z+=B.length,L+=128,B+=String.fromCharCode.apply(null,new Uint16Array(R.subarray(L,L+128)));return-1<N?(M!==!1&&(R.pos+=z+N+1),V+B.slice(0,N)):!1},d=function(R){let S=/^#\?(\S+)/,M=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,P=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,L=/^\s*FORMAT=(\S+)\s*$/,N=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,z={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},V,B;for((R.pos>=R.byteLength||!(V=h(R)))&&a(1,"no header found"),(B=V.match(S))||a(3,"bad initial token"),z.valid|=1,z.programtype=B[1],z.string+=V+`
`;V=h(R),V!==!1;){if(z.string+=V+`
`,V.charAt(0)==="#"){z.comments+=V+`
`;continue}if((B=V.match(M))&&(z.gamma=parseFloat(B[1])),(B=V.match(P))&&(z.exposure=parseFloat(B[1])),(B=V.match(L))&&(z.valid|=2,z.format=B[1]),(B=V.match(N))&&(z.valid|=4,z.height=parseInt(B[1],10),z.width=parseInt(B[2],10)),z.valid&2&&z.valid&4)break}return z.valid&2||a(3,"missing format specifier"),z.valid&4||a(3,"missing image size specifier"),z},f=function(R,S,M){let P=S;if(P<8||P>32767||R[0]!==2||R[1]!==2||R[2]&128)return new Uint8Array(R);P!==(R[2]<<8|R[3])&&a(3,"wrong scanline width");let L=new Uint8Array(4*S*M);L.length||a(4,"unable to allocate buffer space");let N=0,z=0,V=4*P,B=new Uint8Array(4),ie=new Uint8Array(V),G=M;for(;G>0&&z<R.byteLength;){z+4>R.byteLength&&a(1),B[0]=R[z++],B[1]=R[z++],B[2]=R[z++],B[3]=R[z++],(B[0]!=2||B[1]!=2||(B[2]<<8|B[3])!=P)&&a(3,"bad rgbe scanline format");let oe=0,le;for(;oe<V&&z<R.byteLength;){le=R[z++];let Ae=le>128;if(Ae&&(le-=128),(le===0||oe+le>V)&&a(3,"bad scanline data"),Ae){let Ne=R[z++];for(let Ve=0;Ve<le;Ve++)ie[oe++]=Ne}else ie.set(R.subarray(z,z+le),oe),oe+=le,z+=le}let Me=P;for(let Ae=0;Ae<Me;Ae++){let Ne=0;L[N]=ie[Ae+Ne],Ne+=P,L[N+1]=ie[Ae+Ne],Ne+=P,L[N+2]=ie[Ae+Ne],Ne+=P,L[N+3]=ie[Ae+Ne],N+=4}G--}return L},m=function(R,S,M,P){let L=R[S+3],N=Math.pow(2,L-128)/255;M[P+0]=R[S+0]*N,M[P+1]=R[S+1]*N,M[P+2]=R[S+2]*N,M[P+3]=1},_=function(R,S,M,P){let L=R[S+3],N=Math.pow(2,L-128)/255;M[P+0]=es.toHalfFloat(Math.min(R[S+0]*N,65504)),M[P+1]=es.toHalfFloat(Math.min(R[S+1]*N,65504)),M[P+2]=es.toHalfFloat(Math.min(R[S+2]*N,65504)),M[P+3]=es.toHalfFloat(1)},g=new Uint8Array(e);g.pos=0;let p=d(g),b=p.width,x=p.height,y=f(g.subarray(g.pos),b,x),E,A,I;switch(this.type){case ln:I=y.length/4;let R=new Float32Array(I*4);for(let M=0;M<I;M++)m(y,M*4,R,M*4);E=R,A=ln;break;case Ut:I=y.length/4;let S=new Uint16Array(I*4);for(let M=0;M<I;M++)_(y,M*4,S,M*4);E=S,A=Ut;break;default:throw new Error("THREE.HDRLoader: Unsupported type: "+this.type)}return{width:b,height:x,data:E,header:p.string,gamma:p.gamma,exposure:p.exposure,type:A}}setDataType(e){return this.type=e,this}load(e,t,n,s){function r(a,o){switch(a.type){case ln:case Ut:a.colorSpace=Ht,a.minFilter=Lt,a.magFilter=Lt,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,r,n,s)}};var Xr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


    }`};var zn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},fb=new ki(-1,1,1,-1,0,1),Pd=class extends gt{constructor(){super(),this.setAttribute("position",new rt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new rt([0,2,0,0,2,0],2))}},pb=new Pd,us=class{constructor(e){this._mesh=new it(pb,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,fb)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Hc=class extends zn{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof St?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=un.clone(e.uniforms),this.material=new St({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new us(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var ho=class extends zn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Vc=class extends zn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Gc=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new ce);this._width=n.width,this._height=n.height,t=new Vt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ut}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Hc(Xr),this.copyPass.material.blending=zt,this.clock=new Za}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ho!==void 0&&(a instanceof ho?n=!0:a instanceof Vc&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new ce);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Wc=class extends zn{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ie}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var fo={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ce},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Re},cameraProjectionMatrixInverse:{value:new Re},cameraWorldMatrix:{value:new Re},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new C(-1,-1,-1)},sceneBoxMax:{value:new C(1,1,1)}},vertexShader:`

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
    }`},po={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

    }`},jc={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
    }`};function Hm(i=5){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=mb(e),n=t.length,s=new Uint8Array(n*4);for(let a=0;a<n;++a){let o=t[a],l=2*Math.PI*o/n,c=new C(Math.cos(l),Math.sin(l),0).normalize();s[a*4]=(c.x*.5+.5)*255,s[a*4+1]=(c.y*.5+.5)*255,s[a*4+2]=127,s[a*4+3]=255}let r=new di(s,e,e);return r.wrapS=kt,r.wrapT=kt,r.needsUpdate=!0,r}function mb(i){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=e*e,n=Array(t).fill(0),s=Math.floor(e/2),r=e-1;for(let a=1;a<=t;){if(s===-1&&r===e?(r=e-2,s=0):(r===e&&(r=0),s<0&&(s=e-1)),n[s*e+r]!==0){r-=2,s++;continue}else n[s*e+r]=a++;r++,s--}return n}var mo={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Id(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ce},cameraProjectionMatrixInverse:{value:new Re},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
    }`};function Id(i,e,t){let n=gb(i,e,t),s="vec3[SAMPLES](";for(let r=0;r<i;r++){let a=n[r];s+=`vec3(${a.x}, ${a.y}, ${a.z})${r<i-1?",":")"}`}return s}function gb(i,e,t){let n=[];for(let s=0;s<i;s++){let r=2*Math.PI*e*s/i,a=Math.pow(s/(i-1),t);n.push(new C(Math.cos(r),Math.sin(r),a))}return n}var qc=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,s,r,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,l=Math.floor(e+o),c=Math.floor(t+o),u=(3-Math.sqrt(3))/6,h=(l+c)*u,d=l-h,f=c-h,m=e-d,_=t-f,g,p;m>_?(g=1,p=0):(g=0,p=1);let b=m-g+u,x=_-p+u,y=m-1+2*u,E=_-1+2*u,A=l&255,I=c&255,R=this.perm[A+this.perm[I]]%12,S=this.perm[A+g+this.perm[I+p]]%12,M=this.perm[A+1+this.perm[I+1]]%12,P=.5-m*m-_*_;P<0?n=0:(P*=P,n=P*P*this._dot(this.grad3[R],m,_));let L=.5-b*b-x*x;L<0?s=0:(L*=L,s=L*L*this._dot(this.grad3[S],b,x));let N=.5-y*y-E*E;return N<0?r=0:(N*=N,r=N*N*this._dot(this.grad3[M],y,E)),70*(n+s+r)}noise3d(e,t,n){let s,r,a,o,c=(e+t+n)*.3333333333333333,u=Math.floor(e+c),h=Math.floor(t+c),d=Math.floor(n+c),f=1/6,m=(u+h+d)*f,_=u-m,g=h-m,p=d-m,b=e-_,x=t-g,y=n-p,E,A,I,R,S,M;b>=x?x>=y?(E=1,A=0,I=0,R=1,S=1,M=0):b>=y?(E=1,A=0,I=0,R=1,S=0,M=1):(E=0,A=0,I=1,R=1,S=0,M=1):x<y?(E=0,A=0,I=1,R=0,S=1,M=1):b<y?(E=0,A=1,I=0,R=0,S=1,M=1):(E=0,A=1,I=0,R=1,S=1,M=0);let P=b-E+f,L=x-A+f,N=y-I+f,z=b-R+2*f,V=x-S+2*f,B=y-M+2*f,ie=b-1+3*f,G=x-1+3*f,oe=y-1+3*f,le=u&255,Me=h&255,Ae=d&255,Ne=this.perm[le+this.perm[Me+this.perm[Ae]]]%12,Ve=this.perm[le+E+this.perm[Me+A+this.perm[Ae+I]]]%12,fe=this.perm[le+R+this.perm[Me+S+this.perm[Ae+M]]]%12,q=this.perm[le+1+this.perm[Me+1+this.perm[Ae+1]]]%12,Z=.6-b*b-x*x-y*y;Z<0?s=0:(Z*=Z,s=Z*Z*this._dot3(this.grad3[Ne],b,x,y));let me=.6-P*P-L*L-N*N;me<0?r=0:(me*=me,r=me*me*this._dot3(this.grad3[Ve],P,L,N));let we=.6-z*z-V*V-B*B;we<0?a=0:(we*=we,a=we*we*this._dot3(this.grad3[fe],z,V,B));let _e=.6-ie*ie-G*G-oe*oe;return _e<0?o=0:(_e*=_e,o=_e*_e*this._dot3(this.grad3[q],ie,G,oe)),32*(s+r+a+o)}noise4d(e,t,n,s){let r=this.grad4,a=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,u,h,d,f,m,_=(e+t+n+s)*l,g=Math.floor(e+_),p=Math.floor(t+_),b=Math.floor(n+_),x=Math.floor(s+_),y=(g+p+b+x)*c,E=g-y,A=p-y,I=b-y,R=x-y,S=e-E,M=t-A,P=n-I,L=s-R,N=S>M?32:0,z=S>P?16:0,V=M>P?8:0,B=S>L?4:0,ie=M>L?2:0,G=P>L?1:0,oe=N+z+V+B+ie+G,le=a[oe][0]>=3?1:0,Me=a[oe][1]>=3?1:0,Ae=a[oe][2]>=3?1:0,Ne=a[oe][3]>=3?1:0,Ve=a[oe][0]>=2?1:0,fe=a[oe][1]>=2?1:0,q=a[oe][2]>=2?1:0,Z=a[oe][3]>=2?1:0,me=a[oe][0]>=1?1:0,we=a[oe][1]>=1?1:0,_e=a[oe][2]>=1?1:0,Oe=a[oe][3]>=1?1:0,dt=S-le+c,U=M-Me+c,lt=P-Ae+c,ze=L-Ne+c,Y=S-Ve+2*c,re=M-fe+2*c,Be=P-q+2*c,he=L-Z+2*c,Pe=S-me+3*c,$e=M-we+3*c,Je=P-_e+3*c,D=L-Oe+3*c,v=S-1+4*c,F=M-1+4*c,J=P-1+4*c,te=L-1+4*c,W=g&255,ge=p&255,ae=b&255,xe=x&255,ye=o[W+o[ge+o[ae+o[xe]]]]%32,se=o[W+le+o[ge+Me+o[ae+Ae+o[xe+Ne]]]]%32,pe=o[W+Ve+o[ge+fe+o[ae+q+o[xe+Z]]]]%32,Le=o[W+me+o[ge+we+o[ae+_e+o[xe+Oe]]]]%32,Ee=o[W+1+o[ge+1+o[ae+1+o[xe+1]]]]%32,de=.6-S*S-M*M-P*P-L*L;de<0?u=0:(de*=de,u=de*de*this._dot4(r[ye],S,M,P,L));let Ue=.6-dt*dt-U*U-lt*lt-ze*ze;Ue<0?h=0:(Ue*=Ue,h=Ue*Ue*this._dot4(r[se],dt,U,lt,ze));let w=.6-Y*Y-re*re-Be*Be-he*he;w<0?d=0:(w*=w,d=w*w*this._dot4(r[pe],Y,re,Be,he));let O=.6-Pe*Pe-$e*$e-Je*Je-D*D;O<0?f=0:(O*=O,f=O*O*this._dot4(r[Le],Pe,$e,Je,D));let j=.6-v*v-F*F-J*J-te*te;return j<0?m=0:(j*=j,m=j*j*this._dot4(r[Ee],v,F,J,te)),27*(u+h+d+f+m)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,s){return e[0]*t+e[1]*n+e[2]*s}_dot4(e,t,n,s,r){return e[0]*t+e[1]*n+e[2]*s+e[3]*r}};var go=class i extends zn{constructor(e,t,n=512,s=512,r,a,o){super(),this.width=n,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Hm(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Vt(this.width,this.height,{type:Ut}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new St({defines:Object.assign({},fo.defines),uniforms:un.clone(fo.uniforms),vertexShader:fo.vertexShader,fragmentShader:fo.fragmentShader,blending:zt,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ha,this.normalMaterial.blending=zt,this.pdMaterial=new St({defines:Object.assign({},mo.defines),uniforms:un.clone(mo.uniforms),vertexShader:mo.vertexShader,fragmentShader:mo.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new St({defines:Object.assign({},po.defines),uniforms:un.clone(po.uniforms),vertexShader:po.vertexShader,fragmentShader:po.fragmentShader,blending:zt}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new St({uniforms:un.clone(Xr.uniforms),vertexShader:Xr.vertexShader,fragmentShader:Xr.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:eo,blendDst:ks,blendEquation:Dn,blendSrcAlpha:Qa,blendDstAlpha:ks,blendEquationAlpha:Dn}),this.blendMaterial=new St({uniforms:un.clone(jc.uniforms),vertexShader:jc.vertexShader,fragmentShader:jc.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Cl,blendSrc:eo,blendDst:ks,blendEquation:Dn,blendSrcAlpha:Qa,blendDstAlpha:ks,blendEquationAlpha:Dn}),this._fsQuad=new us(null),this._originalClearColor=new Ie,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Is,this.depthTexture.format=as,this.depthTexture.type=rs,this.normalRenderTarget=new Vt(this.width,this.height,{minFilter:Ft,magFilter:Ft,type:Ut,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let n=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Id(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case i.OUTPUT.Off:break;case i.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,n,s,r){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,s,r){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s=t.clearColor||s,r=t.clearAlpha||r,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){(n.isPoints||n.isLine||n.isLine2)&&n.visible&&(n.visible=!1,t.push(n))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new qc,n=e*e*4,s=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){let l=a,c=o;s[(a*e+o)*4]=(t.noise(l,c)*.5+.5)*255,s[(a*e+o)*4+1]=(t.noise(l+e,c)*.5+.5)*255,s[(a*e+o)*4+2]=(t.noise(l,c+e)*.5+.5)*255,s[(a*e+o)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let r=new di(s,e,e,_n,Fn);return r.wrapS=kt,r.wrapT=kt,r.needsUpdate=!0,r}};go.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var _o={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

    }`};var Xc=class extends zn{constructor(){super(),this.uniforms=un.clone(_o.uniforms),this.material=new ka({name:_o.name,uniforms:this.uniforms,vertexShader:_o.vertexShader,fragmentShader:_o.fragmentShader}),this._fsQuad=new us(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Qe.getTransfer(this._outputColorSpace)===ht&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ol?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===zl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Bl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Fr?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Hl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Vl?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===kl&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var yo={elevation:38,azimuth:-35,sunlight:1.85,exposure:1.02,reflection:.9,ambient:.26,haze:.08,occlusion:.75,wetness:.62},Dd={elevation:[12,85],azimuth:[-180,180],sunlight:[0,5],exposure:[.45,1.6],reflection:[0,1.8],ambient:[.1,1.5],haze:[0,.3],occlusion:[0,1.4],wetness:[0,1]},xo={day:{...yo},golden:{...yo,elevation:25,azimuth:-70,sunlight:3.1,exposure:.94,reflection:.85,ambient:.34,haze:.07},soft:{...yo,elevation:65,azimuth:20,sunlight:1.25,ambient:.8,reflection:.9,exposure:1.04,haze:.035}};function Yc(i={}){return Object.fromEntries(Object.entries(yo).map(([e,t])=>{let[n,s]=Dd[e],r=i?.[e];return[e,Number.isFinite(r)?Math.min(s,Math.max(n,r)):t]}))}function Vm(i){let e=(t,n)=>{let s=1,r=0;for(;t>0;)s/=n,r+=s*(t%n),t=Math.floor(t/n);return r};return[e(i+1,2)-.5,e(i+1,3)-.5]}function Gm({visuals:i,exportImage:e,invalidate:t}){let n=document.createElement("section");n.className="render-studio panel",n.hidden=!0,n.setAttribute("aria-label","\u5149\u5F71\u6E32\u67D3\u8BBE\u7F6E"),n.innerHTML='<div class="studio-heading"><div><small>LIGHT & SURFACE</small><h2>\u5149\u5F71\u5DE5\u4F5C\u53F0</h2></div><button id="close-render-studio" class="icon-button" aria-label="\u5173\u95ED\u5149\u5F71\u5DE5\u4F5C\u53F0">\xD7</button></div><p class="studio-note">\u8C03\u6574\u5149\u7EBF\u4E0E\u53CD\u5149\uFF0C\u9884\u89C8\u5F53\u524D\u5EFA\u7B51\u3002</p><div class="light-presets"><button data-light-preset="day">\u6674\u65E5</button><button data-light-preset="golden">\u6696\u9633</button><button data-light-preset="soft">\u67D4\u5149</button></div><div id="render-sliders"></div><label class="check"><input id="studio-compare" type="checkbox">\u5BF9\u6BD4\u57FA\u7840\u5149\u7167</label><div class="studio-actions"><button id="reset-light">\u6062\u590D\u5149\u5F71</button><button id="studio-export">\u6E32\u67D3 4K \u539F\u56FE</button></div><p class="studio-note">4K \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 PNG<br>\u9759\u5E27\u6E32\u67D3\u671F\u95F4\u4F1A\u6682\u65F6\u9501\u5B9A\u89C6\u89D2\u3002</p>',document.body.append(n);let s=d=>n.querySelector(d),r=document.querySelector("#open-render-studio");nn(s("#close-render-studio"),"close","");let a;try{a=JSON.parse(localStorage.getItem("campus-render-settings"))}catch{}let o=Yc(a),l=!1,c={elevation:"\u592A\u9633\u9AD8\u5EA6",azimuth:"\u5149\u7167\u65B9\u5411",sunlight:"\u9633\u5149\u5F3A\u5EA6",exposure:"\u753B\u9762\u66DD\u5149",reflection:"\u73AF\u5883\u53CD\u5149",ambient:"\u6697\u90E8\u8865\u5149",haze:"\u7A7A\u6C14\u900F\u89C6",occlusion:"\u63A5\u89E6\u9634\u5F71",wetness:"\u5730\u8868\u6E7F\u6DA6\u5EA6"};for(let[d,f]of Object.entries(c)){let m=document.createElement("label");m.className="render-slider";let _=document.createElement("span"),g=document.createElement("output"),p=document.createElement("input");_.textContent=f,p.type="range",p.min=Dd[d][0],p.max=Dd[d][1],p.step=d==="azimuth"||d==="elevation"?1:.01,p.dataset.renderSetting=d,p.setAttribute("aria-label",f),p.oninput=()=>{o[d]=Number(p.value),l=!1,s("#studio-compare").checked=!1,u(!1)},p.onchange=()=>u(!0),m.append(_,g,p),s("#render-sliders").append(m)}function u(d=!0){for(let f of n.querySelectorAll("[data-render-setting]")){let m=f.dataset.renderSetting;f.value=o[m],f.previousElementSibling.value=m==="azimuth"||m==="elevation"?o[m]+"\xB0":o[m].toFixed(2)}i.configure(l?{...o,reflection:0,occlusion:0}:o,{rebuild:d});try{localStorage.setItem("campus-render-settings",JSON.stringify(o))}catch{}t()}let h=d=>{n.hidden=!d,r.setAttribute("aria-expanded",String(d)),t()};return r.onclick=()=>h(n.hidden),s("#close-render-studio").onclick=()=>h(!1),n.querySelectorAll("[data-light-preset]").forEach(d=>d.onclick=()=>{o={...xo[d.dataset.lightPreset]},l=!1,s("#studio-compare").checked=!1,document.querySelector("#daylight").value=d.dataset.lightPreset==="golden"?"golden":"day",u()}),s("#studio-compare").onchange=()=>{l=s("#studio-compare").checked,u(!1)},s("#reset-light").onclick=()=>{o={...yo},l=!1,s("#studio-compare").checked=!1,u()},s("#studio-export").onclick=e,document.querySelector("#daylight").addEventListener("change",d=>{o={...xo[d.target.value]},l=!1,u()}),u(),{panel:n,get settings(){return{...o}},setOpen:h}}function Wm({renderer:i,scene:e,camera:t}){let n=null,s=[],r=0,a=0,o=!0;function l(){for(let{mirror:h}of s)e.remove(h),h.geometry.dispose(),h.dispose();s=[]}function c(h){n!==h&&(l(),n=h,n&&(n.updateMatrixWorld(!0),n.traverse(d=>{if(!d.isMesh||d.material?.userData.visualFinish!=="water")return;let f=d.geometry.clone().applyMatrix4(d.matrixWorld);f.computeBoundingBox();let m=f.boundingBox,_=m.getSize(new C);if(_.y>.2||_.x*_.z<600){f.dispose();return}let g=(m.min.y+m.max.y)/2;f.translate(0,-g,0).rotateX(Math.PI/2);let p={...Qt.ReflectorShader,uniforms:{...Qt.ReflectorShader.uniforms,strength:{value:.5},settledDetail:{value:1}},vertexShader:Qt.ReflectorShader.vertexShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vWaterWorld;").replace("vUv = textureMatrix",`vWaterWorld=(modelMatrix*vec4(position,1.)).xyz;
 vUv = textureMatrix`),fragmentShader:Qt.ReflectorShader.fragmentShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vWaterWorld; uniform float strength; uniform float settledDetail;").replace("vec4 base = texture2DProj( tDiffuse, vUv );",`
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
            }`).replace("gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );","float f0=pow((1.333-1.)/(1.333+1.),2.); float fresnel=f0+(1.-f0)*pow(1.-abs(normalize(cameraPosition-vWaterWorld).y),5.); gl_FragColor=vec4(base.rgb*color,clamp(strength*fresnel*.8,0.,.8));")},b=new Qt(f,{textureWidth:1024,textureHeight:1024,color:14741227,clipBias:5e-4,multisample:4,shader:p});b.name="Cached shoreline reflection",b.rotation.x=-Math.PI/2,b.position.y=g+.035,b.material.transparent=!0,b.material.depthWrite=!1,b.renderOrder=2;let x={source:d,mirror:b,captured:!1},y=b.onBeforeRender,E=new Re,A=new Re,I=-1;b.onBeforeRender=(R,S,M)=>{if(S.overrideMaterial||M!==t||!o||I===r&&E.equals(t.matrixWorld)&&A.equals(t.projectionMatrix))return;let P=[];e.traverse(L=>{L!==b&&(L.isReflector||L.isLine||L.isLineSegments)&&L.visible&&(P.push(L),L.visible=!1)});try{y.call(b,R,S,M),a++,x.captured=!0,E.copy(t.matrixWorld),A.copy(t.projectionMatrix),I=r}finally{P.forEach(L=>L.visible=!0)}},e.add(b),s.push(x)})))}function u({moving:h,quality:d,strength:f}){o=!h;for(let{source:m,mirror:_,captured:g}of s){let p=!0;for(let b=m;b;b=b.parent)b.visible||(p=!1);_.visible=p&&(!h||g)&&d!=="balanced"&&f>0,_.material.uniforms.strength.value=f,_.material.uniforms.settledDetail.value=h?0:1}}return{attach:c,prepare:u,invalidate:()=>r++,get diagnostics(){return{surfaces:s.length,updates:a,mode:"cached planar shoreline",retainDuringMotion:!0}}}}function jm(i){let e=i.index?i.toNonIndexed():i.clone(),t=e.getAttribute("position"),n=new Map,s=[],r=o=>o.toArray().map(l=>Math.round(l*1e4)).join(",");for(let o=0;o<t.count;o+=3){let l=[0,1,2].map(d=>new C().fromBufferAttribute(t,o+d)),c=new C().crossVectors(l[1].clone().sub(l[0]),l[2].clone().sub(l[0])),u=c.length();c.normalize();let h={index:o,normal:c,area:u,edges:[]};s.push(h);for(let d=0;d<3;d++){let f=l[(d+1)%3],m=l[(d+2)%3],_=[r(f),r(m)].sort().join("|");n.has(_)||n.set(_,[]),n.get(_).push(h),h.edges.push({id:_,height:u/Math.max(f.distanceTo(m),1e-8)})}}let a=new Float32Array(t.count*3);for(let o of s)for(let l=0;l<3;l++){let{id:c,height:u}=o.edges[l],h=n.get(c),d=h.length===1||h.some(f=>o.normal.dot(f.normal)<.995);for(let f=0;f<3;f++)a[(o.index+f)*3+l]=d?f===l?u:0:1e5}return e.setAttribute("campusEdgeDistance",new ut(a,3)),e}function _b(i){if(!i)return[];i.updateMatrixWorld(!0);let e=[];return i.traverse(t=>{if(!t.isMesh||t.material?.userData.visualFinish!=="glass")return;let n=t.geometry,s=n.attributes.position,r=n.index?.count??s.count,a=new Map;for(let o=0;o<r;o+=3){let l=[0,1,2].map(m=>new C().fromBufferAttribute(s,n.index?n.index.getX(o+m):o+m).applyMatrix4(t.matrixWorld)),c=new C().crossVectors(l[1].clone().sub(l[0]),l[2].clone().sub(l[0])),u=c.length()/2;if(u<.001||(c.normalize(),Math.abs(c.y)>.1))continue;let h=c.dot(l[0]),d=[...c.toArray().map(m=>Math.round(m*1e3)),Math.round(h*20)].join(",");a.has(d)||a.set(d,{source:t,normal:c,distance:h,area:0,vertices:[],center:new C});let f=a.get(d);f.area+=u;for(let m of l)f.vertices.push(...m.toArray()),f.center.addScaledVector(m,u/3)}for(let o of a.values())if(o.area>=25){o.center.divideScalar(o.area),o.bounds=new Ot;for(let l=0;l<o.vertices.length;l+=3)o.bounds.expandByPoint(new C().fromArray(o.vertices,l));e.push(o)}}),e}var qm=i=>{if(i.material?.userData.visualFinish!=="glass")return!1;for(let e=i;e;e=e.parent)if(!e.visible)return!1;return!0};function Xm({scene:i,camera:e}){let t=null,n=[],s=null,r=null,a=!1,o=!0,l=0,c=-1,u=0,h=new Re,d=new Re,f=new is,m=new Re;function _(){r&&(i.remove(r),r.geometry.dispose(),r.dispose()),r=null,s=null,a=!1,c=-1}function g(x){t!==x&&(_(),t=x,n=_b(t))}function p(x){if(x===s||(_(),!x))return;s=x;let y=new Kt().setFromUnitVectors(new C(0,0,1),x.normal),E=y.clone().invert(),A=x.normal.clone().multiplyScalar(x.distance),I=new gt,R=new Float32Array(x.vertices.length);for(let P=0;P<R.length;P+=3)new C().fromArray(x.vertices,P).sub(A).applyQuaternion(E).toArray(R,P);I.setAttribute("position",new ut(R,3)),I.computeVertexNormals();let S={...Qt.ReflectorShader,uniforms:{...Qt.ReflectorShader.uniforms,strength:{value:.8},facadeNormal:{value:x.normal.clone()}},vertexShader:Qt.ReflectorShader.vertexShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vGlassWorld;").replace("vUv = textureMatrix","vGlassWorld=(modelMatrix*vec4(position,1.)).xyz; vUv = textureMatrix"),fragmentShader:Qt.ReflectorShader.fragmentShader.replace("varying vec4 vUv;","varying vec4 vUv; varying vec3 vGlassWorld; uniform vec3 facadeNormal; uniform float strength;").replace("vec4 base = texture2DProj( tDiffuse, vUv );","vec4 glassUv=vUv; glassUv.xy+=vec2(sin(vGlassWorld.y*.6),cos(dot(vGlassWorld.xz,vec2(.3,.5))))*.0002*vUv.w; vec2 uv=glassUv.xy/glassUv.w; vec2 blur=vec2(.0013); vec4 base=.4*texture2D(tDiffuse,uv)+.15*(texture2D(tDiffuse,uv+blur)+texture2D(tDiffuse,uv-blur)+texture2D(tDiffuse,uv+vec2(blur.x,-blur.y))+texture2D(tDiffuse,uv+vec2(-blur.x,blur.y)));").replace("gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );","float facing=abs(dot(normalize(cameraPosition-vGlassWorld),facadeNormal)); float f0=pow((1.52-1.)/(1.52+1.),2.); float fresnel=f0+(1.-f0)*pow(1.-facing,5.); gl_FragColor=vec4(base.rgb*color,clamp(strength*fresnel*.65,0.,.65));")};r=new Qt(I,{textureWidth:768,textureHeight:768,color:14018024,clipBias:3e-4,multisample:4,shader:S}),r.name="Cached existing glass facade reflection",r.quaternion.copy(y),r.position.copy(A).addScaledVector(x.normal,.012),r.material.transparent=!0,r.material.depthWrite=!1,r.renderOrder=3;let M=r.onBeforeRender;r.onBeforeRender=(P,L,N)=>{if(!o||N!==e||L.overrideMaterial||c===l&&h.equals(e.matrixWorld)&&d.equals(e.projectionMatrix))return;let z=[];i.traverse(V=>{V!==r&&(V.isReflector||V.isLine||V.isLineSegments)&&V.visible&&(z.push(V),V.visible=!1)});try{M.call(r,P,L,N),a=!0,u++,h.copy(e.matrixWorld),d.copy(e.projectionMatrix),c=l}finally{z.forEach(V=>V.visible=!0)}},i.add(r)}function b({moving:x,quality:y,strength:E}){if(o=!x,!x){let A=null,I=0;if(e.updateMatrixWorld(!0),f.setFromProjectionMatrix(m.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse)),y!=="balanced"&&E>0)for(let R of n){if(!qm(R.source)||!f.intersectsBox(R.bounds))continue;let S=e.position.clone().sub(R.center),M=S.length();if(M>260||S.dot(R.normal)<1)continue;let P=R.area*S.normalize().dot(R.normal)/Math.max(64,M*M)*(R===s?1.2:1);P>I&&(A=R,I=P)}p(A)}r&&(r.visible=qm(s.source)&&y!=="balanced"&&E>0&&(!x||a),r.material.uniforms.strength.value=E)}return{attach:g,prepare:b,invalidate:()=>l++,get diagnostics(){return{availablePlanes:n.length,activePlanes:r?.visible?1:0,activeMaterial:r?.visible?s.source.material.name:null,maximumActivePlanes:1,updates:u,retainDuringMotion:!0,frustumCulled:!0,resolution:768}}}}var Ym=`
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
`;var $m={"/campus-map/viewer/style.css":"/campus-map/viewer/assets/8028d873e30db1dfb6d6-style.css","/campus-map/viewer/map-ui.css":"/campus-map/viewer/assets/1739162669791634595b-map-ui.css","/campus-map/exports/campus-lod0.glb":"/campus-map/viewer/assets/f27109b8da2a97ca8bff-campus-lod0.glb","/campus-map/exports/campus-lod1.glb":"/campus-map/viewer/assets/9ef76a7349602f01aa20-campus-lod1.glb","/campus-map/exports/campus-lod2.glb":"/campus-map/viewer/assets/2f2c942444553e9a5f8e-campus-lod2.glb","/campus-map/data/materials/white_plaster_02-Diffuse.jpg":"/campus-map/viewer/assets/a1ebbe091bd1ae93d2ab-white_plaster_02-Diffuse.jpg","/campus-map/data/materials/mobile/white_plaster_02-Diffuse.webp":"/campus-map/viewer/assets/2681b3b24566842da7e0-white_plaster_02-Diffuse.webp","/campus-map/data/materials/white_plaster_02-nor_gl.jpg":"/campus-map/viewer/assets/eb572ca3630d5bfde72e-white_plaster_02-nor_gl.jpg","/campus-map/data/materials/mobile/white_plaster_02-nor_gl.webp":"/campus-map/viewer/assets/5374ddae24bfff937498-white_plaster_02-nor_gl.webp","/campus-map/data/materials/white_plaster_02-Rough.jpg":"/campus-map/viewer/assets/4ff1fe957cd161b07f72-white_plaster_02-Rough.jpg","/campus-map/data/materials/mobile/white_plaster_02-Rough.webp":"/campus-map/viewer/assets/64c8cb56a19682b5b0bf-white_plaster_02-Rough.webp","/campus-map/data/materials/asphalt_02-Diffuse.jpg":"/campus-map/viewer/assets/1aa5ce99f58a625c71d4-asphalt_02-Diffuse.jpg","/campus-map/data/materials/mobile/asphalt_02-Diffuse.webp":"/campus-map/viewer/assets/054f3b0c2956cbf0afe7-asphalt_02-Diffuse.webp","/campus-map/data/materials/asphalt_02-nor_gl.jpg":"/campus-map/viewer/assets/42a1c381b53204e83a98-asphalt_02-nor_gl.jpg","/campus-map/data/materials/mobile/asphalt_02-nor_gl.webp":"/campus-map/viewer/assets/953c037fa03f2017795f-asphalt_02-nor_gl.webp","/campus-map/data/materials/asphalt_02-Rough.jpg":"/campus-map/viewer/assets/70ba3edc65525eb4dc36-asphalt_02-Rough.jpg","/campus-map/data/materials/mobile/asphalt_02-Rough.webp":"/campus-map/viewer/assets/9bbed335ea3aa7dd715f-asphalt_02-Rough.webp","/campus-map/data/materials/grass_ground-Diffuse.jpg":"/campus-map/viewer/assets/a79cc5ed65af0f80261b-grass_ground-Diffuse.jpg","/campus-map/data/materials/mobile/grass_ground-Diffuse.webp":"/campus-map/viewer/assets/8291a7404bfb2dbe86f1-grass_ground-Diffuse.webp","/campus-map/data/materials/grass_ground-nor_gl.jpg":"/campus-map/viewer/assets/7000e2ccd479bb7b66dc-grass_ground-nor_gl.jpg","/campus-map/data/materials/mobile/grass_ground-nor_gl.webp":"/campus-map/viewer/assets/16b9b4ae5e0f7293e8f2-grass_ground-nor_gl.webp","/campus-map/data/materials/grass_ground-Rough.jpg":"/campus-map/viewer/assets/111341f948b7e073edf7-grass_ground-Rough.jpg","/campus-map/data/materials/mobile/grass_ground-Rough.webp":"/campus-map/viewer/assets/787e5be80e6b0722b850-grass_ground-Rough.webp","/campus-map/data/materials/overcast_soil_puresky_1k.hdr":"/campus-map/viewer/assets/2dbbbbb1323a8e8989db-overcast_soil_puresky_1k.hdr","/campus-map/data/materials/mobile/overcast_soil_puresky_256.hdr":"/campus-map/viewer/assets/ce0ef3b6f5ad92533c80-overcast_soil_puresky_256.hdr","/campus-map/data/materials/mobile/finishes.bin":"/campus-map/viewer/assets/711d8f37233064806f2f-finishes.bin"};function xb(i){let e=typeof location>"u"?null:new URLSearchParams(location.search).get("startupProbe");return e&&/^[a-z0-9-]{1,40}$/.test(e)?i+"?startupProbe="+e:i}function hs(i){return xb($m[i]||i)}function Zm(i){let e=new DataView(i).getUint32(0,!0);if(e>8192||e+4>i.byteLength)throw Error("Invalid texture pack");let t=JSON.parse(new TextDecoder().decode(new Uint8Array(i,4,e))),n={};for(let{name:s,offset:r,length:a}of t){if(!Number.isInteger(r)||!Number.isInteger(a)||r<0||a<1||4+e+r+a>i.byteLength)throw Error("Invalid texture entry");n[s]=new Uint8Array(i,4+e+r,a)}return n}var Km={version:"BNBU-PBR-20261016",rules:"Photo evidence selects materials; material examples are not surveyed construction specifications. Preserve existing geometry, source UVs and source textures. Red brick, roof tile and foliage are library reserves until their exact locations are confirmed.",materials:[{id:"BNBU_01_White_Plaster",label:"\u767D\u8272\u6D82\u5C42\u5916\u5899",color:"#d9dbd4",roughness:.75,metalness:0,asset:"white_plaster_02",repeat_m:1,assignment:"Photo-observed pale walls and trims; restrained scan microstructure"},{id:"BNBU_02_Red_Brick",label:"\u7EA2\u7816\uFF08\u5F85\u5B9A\u4F4D\uFF09",color:"#9e5542",roughness:.85,metalness:0,assignment:"Reserve only; never replace ochre teaching ceramic with red brick"},{id:"BNBU_03_Facade_Glass",label:"\u5EFA\u7B51\u73BB\u7483",color:"#a4bec2",roughness:.11,metalness:0,ior:1.52,transmission:1,assignment:"Existing glazing only; Blender transmission, runtime analytic depth and cached reflection"},{id:"BNBU_04_Concrete",label:"\u6DF7\u51DD\u571F",color:"#b7b9b2",roughness:.85,metalness:0,assignment:"Uncoated structural concrete; procedural microfinish"},{id:"BNBU_05_Asphalt",label:"\u6CA5\u9752",color:"#505b60",roughness:.9,metalness:0,asset:"asphalt_02",repeat_m:3,assignment:"Existing campus asphalt surfaces"},{id:"BNBU_06_Paving_Stone",label:"\u77F3\u6750\u94FA\u88C5",color:"#c4bb9e",roughness:.7,metalness:0,assignment:"Existing paving; metre-scale joints and microfinish"},{id:"BNBU_07_Grass",label:"\u8349\u576A",color:"#59784b",roughness:.9,metalness:0,asset:"grass_ground",repeat_m:2.51,assignment:"Existing planted surfaces; generic scan tinted to photo palette"},{id:"BNBU_08_Foliage",label:"\u6811\u53F6\uFF08\u6750\u8D28\u9884\u7559\uFF09",color:"#426c35",roughness:.9,metalness:0,assignment:"Reserve for evidenced vegetation geometry"},{id:"BNBU_09_Metal",label:"\u91D1\u5C5E\u7A97\u6846",color:"#536b72",roughness:.3,metalness:1,assignment:"Existing metal mullions, rails and roof perimeter frames"},{id:"BNBU_10_Rubber_Track",label:"\u6A61\u80F6\u8FD0\u52A8\u573A",color:"#a36556",roughness:.85,metalness:0,assignment:"Existing sport surface polygons; preserve original track markings"},{id:"BNBU_11_Roof_Tile",label:"\u5C4B\u9876\u74E6\uFF08\u5F85\u5B9A\u4F4D\uFF09",color:"#8b6554",roughness:.7,metalness:0,assignment:"Reserve only; existing flat roofs stay membrane surfaces"},{id:"BNBU_12_Water",label:"\u6E56\u9762",color:"#365d50",roughness:.18,metalness:0,ior:1.333,transmission:.9,assignment:"Existing shoreline; filtered ripple normals and cached reflections"},{id:"BNBU_13_Ochre_Ceramic",label:"\u6696\u8272\u9676\u7816",color:"#c4a16a",roughness:.72,metalness:0,assignment:"Teaching ochre facade; estimated 0.12 x 0.24 m joints"},{id:"BNBU_14_Roof_Membrane",label:"\u5E73\u5C4B\u9762",color:"#8e9693",roughness:.82,metalness:0,assignment:"Existing flat roof areas; subdued seams and raised existing edges"},{id:"BNBU_15_PV",label:"\u5149\u4F0F\u9762\u677F",color:"#13212d",roughness:.29,metalness:0,assignment:"Registered PV coverage only; no additional panel zones"}]};var bb={white_plaster_02:{scale:1,normal:.18,albedo:.32,mean:[.2692,.2435,.196]},asphalt_02:{scale:3,normal:.45,albedo:.7,mean:[.1033,.1018,.0899]},grass_ground:{scale:2.51,normal:.38,albedo:.7,mean:[.1555,.1178,.048]}};async function Jm(i,{mobile:e=!1}={}){let t=new Fs,n={},s=Math.min(8,i.capabilities.getMaxAnisotropy()),r=null;if(e)try{let a=await fetch(hs("/campus-map/data/materials/mobile/finishes.bin"));if(!a.ok)throw Error("Texture pack unavailable");r=Zm(await a.arrayBuffer())}catch{}return await Promise.all(Object.entries(bb).map(async([a,o])=>{try{let l=await Promise.all(["Diffuse","nor_gl","Rough"].map(async c=>{let u=r?.[`${a}-${c}.webp`],h=u?URL.createObjectURL(new Blob([u],{type:"image/webp"})):null,d;try{d=await t.loadAsync(h||hs(e?`/campus-map/data/materials/mobile/${a}-${c}.webp`:`/campus-map/data/materials/${a}-${c}.jpg`))}finally{h&&URL.revokeObjectURL(h)}return d.wrapS=d.wrapT=kt,d.anisotropy=s,d.colorSpace=c==="Diffuse"?Rt:On,[c,d]}));n[a]={...o,...Object.fromEntries(l)}}catch{console.warn("\u8868\u9762\u8D34\u56FE\u672A\u8F7D\u5165\uFF0C\u4FDD\u7559\u7A0B\u5E8F\u6750\u8D28\uFF1A"+a)}})),n}function Qm(i,e){if(i==="marker"||i==="datum")return null;let n={glass:3,metal:9,water:12,solar:15,ceramic:13,roof:14,sport:10,asphalt:5,paving:6,grass:7}[i]||(/white|pale|paint|plaster|fascia/i.test(e)?1:4);return Km.materials[n-1]}function Ld(i,e,t){return i==="asphalt"?t.asphalt_02:i==="paving"&&t.white_plaster_02?{...t.white_plaster_02,scale:.8,normal:.22,albedo:.38}:i==="grass"?t.grass_ground:i==="stone"&&/white|pale|paint|plaster|fascia|Approximate/i.test(e)?t.white_plaster_02:null}var Ud={value:.62},ds={balanced:{label:"\u6D41\u7545",pixels:2560*1440,dpr:1.5,shadow:2048,ao:!1},high:{label:"\u7CBE\u7EC6",pixels:3200*1800,dpr:2,shadow:4096,ao:!0},ultra:{label:"\u6781\u81F4",pixels:3840*2160,dpr:2.5,shadow:4096,ao:!0}};function tg(i,e,t,n,s=!1){let r=ds[i]||ds.high;return Math.min(n,r.dpr,s?1:1/0,Math.sqrt(r.pixels/Math.max(1,e*t)))}function Mb(i){let e=i.toLowerCase();return/water surface/.test(e)?"water":e==="photo-estimated teaching facade ochre"?"ceramic":/unknown|construction|marker/.test(e)?"marker":/frame|mullion|rail|fence|lattice|border|roof equipment/.test(e)?/mullion|rail|fence|lattice|equipment/.test(e)?"metal":"stone":/\bpv\b/.test(e)?"solar":/glass|glazing|skylight|admin se bands|hall circular roof band/.test(e)?"glass":/asphalt|parking/.test(e)?"asphalt":/paving|terrace.*finish/.test(e)?"paving":/vegetat|planting|lawn/.test(e)?"grass":/datum/.test(e)?"datum":/\bsports?\b|\btrack\b|\bcourts?\b|\bmarkings?\b|\blines\b/.test(e)?"sport":/roof (edge|rim)|roof pale|roof green surround/.test(e)?"stone":/roof/.test(e)?"roof":/cladding/.test(e)&&!/seams/.test(e)?"cladding":"stone"}var Sb=`
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
`;function eg(i,e,t){let n={stone:0,glass:1,metal:2,asphalt:3,paving:4,grass:5,water:6,datum:7,roof:8,marker:9,cladding:10,solar:11,sport:12,ceramic:13};i.onBeforeCompile=s=>{s.uniforms.campusWetness=Ud,Object.assign(s.uniforms,cs),t&&(s.uniforms.campusAlbedoMap={value:t.Diffuse},s.uniforms.campusRoughMap={value:t.Rough},s.uniforms.campusScanNormal={value:t.nor_gl},s.uniforms.campusScanScale={value:t.scale},s.uniforms.campusScanStrength={value:new ce(t.albedo,t.normal)},s.uniforms.campusScanMean={value:new C(...t.mean)});let r={stone:.42,cladding:.42,ceramic:.42,roof:.4,asphalt:.4,paving:.45,grass:.4,datum:.4,glass:.2,water:.2,metal:.45,solar:.3,marker:.5,sport:.3};s.uniforms.campusDiffuseIBL={value:r[e]},s.uniforms.campusSpecularIBL={value:i.envMapIntensity};let a=`
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
#endif`),s.fragmentShader=zm+Sb+a+`
uniform float campusWetness; uniform float campusDiffuseIBL;
uniform float campusSpecularIBL;
#define CAMPUS_SURFACE `+n[e]+`
`+s.fragmentShader,s.fragmentShader=`
#ifdef CAMPUS_SCAN
uniform sampler2D campusAlbedoMap,campusRoughMap,campusScanNormal;uniform float campusScanScale;uniform vec2 campusScanStrength;uniform vec3 campusScanMean;
#endif
`+s.fragmentShader,s.fragmentShader=s.fragmentShader.replace("void main() {",Ym+`
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
    `)},i.customProgramCacheKey=()=>`campus-finish-v5-${e}-${!!i.defines?.CAMPUS_BEVEL}-${!!i.defines?.CAMPUS_PANE_UV}-${!!i.defines?.CAMPUS_INTERIOR}-${!!i.defines?.CAMPUS_SKYLIGHT}-${!!t}`}function ng(){let i=new WeakMap,e=new WeakMap,t={},n=new Map,s={};return{setTextureLibrary(r){s=r;for(let[a,{type:o,name:l}]of n){let c=Ld(o,l,s);c&&(a.defines={...a.defines,CAMPUS_SCAN:1},eg(a,o,c),a.needsUpdate=!0)}},material(r){if(i.has(r))return i.get(r);let a=Mb(r.name),o;a==="glass"||a==="metal"||a==="water"||a==="solar"?(o=new on,Wt.prototype.copy.call(o,r),o.defines={STANDARD:"",PHYSICAL:""}):o=r.clone(),o.name=r.name,o.userData={...r.userData,visualFinish:a,finishVersion:4,finishStatus:"Procedural appearance estimate; original geometry and source metadata retained"},r.userData.registeredPaneUv&&(o.defines={...o.defines,CAMPUS_PANE_UV:1}),r.userData.interiorDepthProxy&&(o.defines={...o.defines,CAMPUS_INTERIOR:1}),r.userData.skylightDepthProxy&&(o.defines={...o.defines,CAMPUS_SKYLIGHT:1}),(a==="stone"||a==="roof")&&/^(Approximate |Neutral roof|White concrete paint)/.test(r.name)&&(o.defines={...o.defines,CAMPUS_BEVEL:1},o.userData.visualBevelMetres=.08),o.dithering=!0,a==="glass"&&(o.color.lerp(new Ie("#8ca6ad"),.5),o.roughness=.11,o.metalness=0,o.clearcoat=0,o.clearcoatRoughness=.18,o.envMapIntensity=1.15,o.ior=1.52),a==="solar"&&(o.color.set("#13212d"),o.roughness=.29,o.metalness=0,o.clearcoat=.3,o.clearcoatRoughness=.13,o.envMapIntensity=.6),a==="metal"&&(o.roughness=.36,o.metalness=1,o.clearcoat=0,o.envMapIntensity=1.05),a==="water"&&(o.color.set("#365d50"),o.roughness=.18,o.metalness=0,o.clearcoat=0,o.clearcoatRoughness=.18,o.envMapIntensity=.75,o.ior=1.333),a==="ceramic"&&(o.color.set("#baa27a"),o.roughness=.72,o.metalness=0,o.envMapIntensity=.32),(a==="stone"||a==="cladding")&&(o.color.multiplyScalar(.86),o.roughness=a==="cladding"?.65:.78,o.metalness=0,o.envMapIntensity=.32),a==="roof"&&(o.color.multiplyScalar(.73),o.roughness=.82,o.metalness=.025,o.envMapIntensity=.4),a==="sport"&&(o.roughness=.94,o.metalness=0,o.envMapIntensity=.4),a==="asphalt"&&(o.color.set("#505b60"),o.roughness=.9,o.metalness=0),a==="paving"&&(o.color.set("#aaa79d"),o.roughness=.78),a==="datum"&&(o.color.set("#999b91"),o.roughness=.96,o.envMapIntensity=.4),a==="grass"&&(o.color.set("#58654b"),o.roughness=.95);let l=Qm(a,r.name);o.userData.libraryId=l?.id||null,["glass","metal","water","solar","ceramic","roof","sport","asphalt","paving","grass"].includes(a)&&(o.roughness=l.roughness,o.metalness=l.metalness),a==="glass"&&(o.roughness=.16,o.specularIntensity=1,r.userData.interiorDepthProxy||(o.transparent=!0,o.opacity=.84,o.depthWrite=!1)),a==="metal"&&(o.roughness=.36),a==="water"&&(o.roughness=.22);let c=r.map||r.normalMap?null:Ld(a,r.name,s);return!r.map&&!r.normalMap&&n.set(o,{type:a,name:r.name}),c&&(o.defines={...o.defines,CAMPUS_SCAN:1}),eg(o,a,c),i.set(r,o),t[a]=(t[a]||0)+1,o},prepareMesh(r){if(!r.material.userData.visualBevelMetres)return;let a=r.geometry;e.has(a)||e.set(a,jm(a)),r.geometry=e.get(a)},get counts(){return{...t}},get textureLibrary(){return{loadedAssets:Object.keys(s),maps:Object.keys(s).length*3,resolution:Object.values(s)[0]?.Diffuse?.image?.width||0,localFiles:!0,sourceTexturesPreserved:!0}}}}function ig({renderer:i,scene:e,camera:t,controls:n,invalidate:s,initialQuality:r="high",deferEnvironment:a=!1}){let o=!a,l="clear",c=ds[r]?r:"high",u=[1,1],h=new C(1/0,0,0),d=0,f=Yc(),m=Bm({renderer:i,scene:e,camera:t}),_=Wm({renderer:i,scene:e,camera:t}),g=Xm({scene:e,camera:t}),p=new uo;p.scale.setScalar(2e4),p.name="Daylight atmosphere",p.material.uniforms.turbidity.value=3,p.material.uniforms.rayleigh.value=2.2,p.material.uniforms.mieCoefficient.value=.003,p.material.uniforms.mieDirectionalG.value=.82,p.material.uniforms.weatherCloud={value:0},p.material.fragmentShader=`
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
  `),e.add(p);let b=new ja(14083827,7434596,.38);e.add(b);let x=new zs(16773337,3);x.castShadow=!0,x.shadow.mapSize.setScalar(ds[c].shadow),x.shadow.radius=3,x.shadow.bias=-8e-5,x.shadow.normalBias=.1,x.shadow.camera.near=1,x.shadow.camera.far=7e3,e.add(x,x.target);let y=new Wr(i),E,A,I,R,S=!1,M=!0,P=new Sr(256,{type:Ut}),L=new Mr(1,12e3,P),N=new C(1/0,0,0),z=new C;function V(fe,{rebuild:q=!0}={}){f=Yc({...f,...fe}),Ud.value=f.wetness;let Z=ft.degToRad(f.elevation),me=ft.degToRad(f.azimuth);z.set(Math.sin(me)*Math.cos(Z),Math.sin(Z),Math.cos(me)*Math.cos(Z)),p.material.uniforms.sunPosition.value.copy(z);let we=f.elevation<35;x.color.set(we?16767926:16774120),x.intensity=f.sunlight,b.intensity=f.ambient,e.fog=new Er(we?14998218:13952237,f.haze*.001);let _e=co[l];if(p.material.uniforms.weatherCloud.value=Math.max(.3,_e.cloud),x.intensity*=_e.sun,b.intensity*=_e.ambient,l!=="clear"&&(e.fog=new Er(_e.color,Math.max(f.haze*.001,_e.fog))),e.environmentIntensity=f.reflection,i.toneMappingExposure=f.exposure,le.blendIntensity=f.occlusion,q&&o){if(S=!!(I&&f.elevation>=35&&(l==="clear"||l==="cloudy")),p.visible=!S,e.background=S?I:null,e.backgroundIntensity=.78,e.backgroundBlurriness=.015,e.backgroundRotation.set(0,me,0),e.environmentRotation.set(0,S?me:0,0),S)E&&E!==R&&E.dispose(),E=R;else{let Oe=new Cs,dt=p.clone();Oe.add(dt);let U=y.fromScene(Oe,.025,.1,3e4);E&&E!==R&&E.dispose(),E=U}e.environment=E.texture}q&&(M=!0),_.invalidate(),g.invalidate(),m.invalidate(),d=0,Ae(!0),s()}function B(fe="day"){V(xo[fe]||xo.day)}let ie=new Vt(1,1,{type:Ut,samples:c==="balanced"?2:4}),G=new Gc(i,ie);G.setPixelRatio(1);let oe=new Wc(e,t),le=new go(e,t,1,1,void 0,{radius:3.2,thickness:1.4,distanceExponent:1.5,scale:1,samples:12});le.blendIntensity=.7,G.addPass(oe),G.addPass(le),G.addPass(new Xc);function Me(fe,q){u=[fe,q],G.setSize(fe,q),le.setSize(Math.max(1,Math.round(fe*.5)),Math.max(1,Math.round(q*.5)))}function Ae(fe=!1){let q=t.position.distanceTo(n.target),Z=ft.clamp(q*.65,100,1700);return!fe&&Math.abs(Z-d)<d*.2&&h.distanceTo(n.target)<Z*.15?!1:(h.copy(n.target),d=Z,x.target.position.copy(h),x.position.copy(h).addScaledVector(z,3e3),Object.assign(x.shadow.camera,{left:-Z,right:Z,top:Z,bottom:-Z}),x.shadow.camera.updateProjectionMatrix(),i.shadowMap.needsUpdate=!0,!0)}function Ne(fe){c=ds[fe]?fe:"high",le.enabled=ds[c].ao;let q=ds[c].shadow;x.shadow.mapSize.x!==q&&(x.shadow.mapSize.setScalar(q),x.shadow.map?.dispose(),x.shadow.map=null),M=!0,Ae(!0),s()}function Ve(){if(!E)return;if(c==="balanced"||t.position.distanceTo(n.target)>1500){e.environment=E.texture,e.environmentRotation.set(0,S?ft.degToRad(f.azimuth):0,0);return}if(!M&&N.distanceTo(n.target)<120){e.environment=A?.texture||E.texture,e.environmentRotation.set(0,A?0:S?ft.degToRad(f.azimuth):0,0);return}N.copy(n.target),L.position.copy(n.target),L.position.y=Math.max(18,n.target.y+12);let fe=e.environment;e.environment=E.texture,e.environmentRotation.set(0,S?ft.degToRad(f.azimuth):0,0);let q=[];e.traverse(Z=>{Z.isReflector&&Z.visible&&(q.push(Z),Z.visible=!1)});try{L.update(i,e);let Z=y.fromCubemap(P.texture);A?.dispose(),A=Z,e.environment=Z.texture,e.environmentRotation.set(0,0,0),M=!1}catch(Z){throw e.environment=fe,Z}finally{q.forEach(Z=>Z.visible=!0)}}return B(),{compileScene:async()=>{let fe=i.getRenderTarget();try{i.setRenderTarget(G.readBuffer),await i.compileAsync(e,t)}finally{i.setRenderTarget(fe)}},loadEnvironment:async({mobile:fe=!1,beforePrepare:q=async()=>{}}={})=>{try{I=await new kc().loadAsync(hs(fe?"/campus-map/data/materials/mobile/overcast_soil_puresky_256.hdr":"/campus-map/data/materials/overcast_soil_puresky_1k.hdr")),await q(),I.mapping=Or,R=y.fromEquirectangular(I)}catch(Z){console.warn("HDR environment unavailable; procedural daylight retained",Z)}o=!0,V({})},prepareEnvironment:()=>{o=!0,V({})},setWeather:fe=>{l=Object.hasOwn(co,fe)?fe:"clear",V({})},render:(fe=!1)=>{let q={moving:fe,quality:c,strength:f.reflection,wetness:f.wetness};m.prepare(q),_.prepare(q),g.prepare(q),le.enabled=ds[c].ao&&!fe&&f.occlusion>0,G.render()},resize:Me,setQuality:Ne,daylight:B,configure:V,updateShadows:Ae,updateEnvironment:Ve,attachWater:fe=>{_.attach(fe),g.attach(fe)},invalidateEnvironment:()=>{M=!0,_.invalidate(),g.invalidate(),m.invalidate()},get quality(){return c},get size(){return[...u]},diagnostics:()=>({quality:c,weather:l,settings:{...f},groundReflection:m.diagnostics,waterReflection:_.diagnostics,glassReflection:g.diagnostics,ambientOcclusion:le.enabled,shadowSize:x.shadow.mapSize.toArray(),shadowRadius:d,indirectLighting:"PMREM image-based approximation; no traced GI",skySource:S?"Poly Haven overcast_soil_puresky CC0":"procedural atmosphere",wetness:Ud.value,environment:e.environment===A?.texture?"cached campus reflection":"procedural daylight",resolution:[...u]})}}function sg({button:i,geolocation:e,secure:t,lifecycle:n,onPosition:s,onClear:r,onState:a}){let o=!1,l=!1,c=0,u=!1,h=(m,_)=>{i.disabled=!1,i.setAttribute("aria-pressed",String(m==="located")),i.title=m==="located"?"\u6E05\u9664\u4F4D\u7F6E":["locating","refining"].includes(m)?"\u53D6\u6D88\u5B9A\u4F4D":"\u5B9A\u4F4D\u6211\u7684\u4F4D\u7F6E",i.classList.toggle("active",m==="located"),a({state:m,..._===void 0?{}:{accuracy:_}})},d=()=>{c++,l=!1,o=!1,r(),u||h("idle")},f=()=>{if(u)return;if(o||l){d();return}if(!t){h("insecure");return}if(!e){h("unsupported");return}let m=++c;l=!0,h("locating");let _=null,g=()=>!u&&m===c,p=x=>{if(!g())return;l=!1;let y=x.coords.accuracy;if(y>1e3){r(),h("imprecise");return}if(!s(x)){r(),h("outside");return}o=!0,h("located",Math.round(y))},b=x=>{if(!g())return;let y=E=>{if(g()){if(E.code!==1&&!x){h("refining"),b(!0);return}if(_&&E.code!==1){p(_);return}l=!1,r(),h({1:"denied",2:"unavailable",3:"timeout"}[E.code]||"unavailable")}};try{e.getCurrentPosition(E=>{if(!g())return;let{latitude:A,longitude:I,accuracy:R}=E.coords;if(![A,I,R].every(Number.isFinite)||Math.abs(A)>90||Math.abs(I)>180||R<0){y({code:2});return}if(!x&&R>300){_=E,h("refining"),b(!0);return}p(_&&_.coords.accuracy<R?_:E)},y,{enableHighAccuracy:x,timeout:x?25e3:1e4,maximumAge:x?0:3e4})}catch{y({code:2})}};b(!1)};return i.onclick=f,n.addEventListener("pagehide",d),{clear:d,dispose:()=>{u=!0,d(),i.onclick=null,n.removeEventListener("pagehide",d)}}}function $c(i,e){i.replaceChildren();function t(n,s){let r=/\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,a=0;for(let o of s.matchAll(r)){n.append(document.createTextNode(s.slice(a,o.index)));let l=document.createElement(o[1]?"strong":o[2]?"code":"a");l.textContent=o[1]||o[2]||o[3],o[4]&&(l.href=o[4],l.target="_blank",l.rel="noreferrer noopener"),n.append(l),a=o.index+o[0].length}n.append(document.createTextNode(s.slice(a)))}for(let n of String(e).split(`
`)){let s=n.startsWith("> "),r=/^[-*] /.test(n),a=document.createElement(s?"blockquote":"p");t(a,s?n.slice(2):r?"\u2022 "+n.slice(2):n||"\xA0"),i.append(a)}}var rg="campus-local-usage";function ag(i){let e={enabled:!1,counts:{}};try{let c=JSON.parse(localStorage.getItem(rg));c&&typeof c.enabled=="boolean"&&c.counts&&typeof c.counts=="object"&&(e=c)}catch{}let t={search:"\u5730\u70B9\u641C\u7D22",place:"\u67E5\u770B\u5730\u70B9",rotate:"\u65CB\u8F6C\u6A21\u5F0F",render:"4K \u6E32\u67D3",share:"\u89C6\u89D2\u5206\u4EAB",layers:"\u56FE\u5C42\u5DE5\u5177"},n=document.createElement("section");n.innerHTML='<h3>\u672C\u673A\u4F7F\u7528\u8BA1\u6570</h3><label class="check"><input id="local-usage-consent" type="checkbox">\u542F\u7528\u672C\u673A\u529F\u80FD\u8BA1\u6570</label><p class="tool-note">\u53EA\u7D2F\u8BA1\u4E0B\u5217\u529F\u80FD\u7684\u6B21\u6570\uFF0C\u53EF\u968F\u65F6\u5173\u95ED\uFF1B\u4E0D\u8BB0\u5F55\u641C\u7D22\u6587\u5B57\u548C\u4F4D\u7F6E\u3002</p><div id="local-usage-counts"></div><button id="clear-local-usage">\u6E05\u9664\u8BA1\u6570</button>',i.append(n);let s=n.querySelector("input"),r=n.querySelector("#local-usage-counts");s.checked=e.enabled;function a(){r.replaceChildren();for(let[c,u]of Object.entries(t)){let h=document.createElement("p");h.textContent=`${u} \xB7 ${Number(e.counts[c])||0}`,r.append(h)}}function o(){try{localStorage.setItem(rg,JSON.stringify(e))}catch{}a()}s.onchange=()=>{e.enabled=s.checked,o()},n.querySelector("button").onclick=()=>{e.counts={},o()};let l=c=>{e.enabled&&(e.counts[c]=(Number(e.counts[c])||0)+1,o())};document.querySelector("#building-search").addEventListener("change",()=>l("search")),document.addEventListener("click",c=>{let u=c.target.closest("button");u&&(u.matches(".map-label,.search-result")?l("place"):u.matches('[data-drag-mode="rotate"]')?l("rotate"):u.matches("#export-4k,#studio-export")?l("render"):u.matches("#share-view,#share-place")?l("share"):u.matches("#open-campus-tools")&&l("layers"))}),a()}var Yr={buildings:!0,roads:!0,water:!0,green:!0,ground:!0,labels:!0};function bo(i,e=[]){let t=new URLSearchParams(i.replace(/^#/,"")),n=h=>h?.split(",").map(Number),s=n(t.get("target")),r=n(t.get("camera")),a=t.get("campus"),o=h=>Array.isArray(h)&&h.length===3&&h.every(d=>Number.isFinite(d)&&Math.abs(d)<2e4),l=t.get("place")||t.get("poi"),c=e.find(h=>h.id===l||h.id.split("/")[1]===l);if(o(s)&&o(r)&&["all","1","2"].includes(a)){let h=r.map((f,m)=>f-s[m]),d=Math.hypot(...h);if(d>=1&&d<=6501&&s[1]>=0&&s[1]<=80&&h[1]/d>=Math.cos(78*Math.PI/180)-1e-4)return{view:a,target:s,position:r,place:c?.id||null}}let u=t.get("map")?.split("/").map(Number);if(u?.length===3&&u.every(Number.isFinite)){let h=Ti(u[2],u[1]);if(Math.hypot(...h)<5e3){let d=ft.clamp(800*2**(17-u[0]),100,3e3);return{view:"all",target:[h[0],0,-h[1]],position:[h[0]+d*.4,d*.7,-h[1]+d*.7],place:c?.id||null}}}return c?{place:c.id}:null}function vo(i){let e=n=>n.map(s=>Number(s.toFixed(3))).join(","),t=new URLSearchParams({campus:i.view,target:e(i.target),camera:e(i.position)});return i.place&&t.set("place",i.place),"#"+t.toString()}function Gi(i,e){try{return JSON.parse(localStorage.getItem(i))??e}catch{return e}}function vi(i,e){try{localStorage.setItem(i,JSON.stringify(e))}catch{}}function We(i,e,t){let n=document.createElement(i);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n}function og({buildings:i,placeData:e,camera:t,controls:n,scene:s,choose:r,focusPoint:a,restoreView:o,getView:l,applyLayers:c,refresh:u,invalidate:h}){let d=w=>document.querySelector(w),f=e.places,m=[...i,...f.filter(w=>!i.some(O=>O.id===w.id))],_=Gi("campus-favorites",[]),g=Gi("campus-place-categories",null),p=new Set((Array.isArray(_)?_:[]).filter(w=>m.some(O=>O.id===w))),b=Gi("campus-layers",{}),x=Object.fromEntries(Object.entries(Yr).map(([w,O])=>[w,typeof b?.[w]=="boolean"?b[w]:O])),y=li.filter(([w])=>w!=="all").map(([w])=>w),E=new Set(Array.isArray(g)?g.filter(w=>y.includes(w)):y);Array.isArray(g)&&y.filter(w=>w!=="transport").every(w=>g.includes(w))&&E.add("transport");let A=null,I=null,R=null,S=null,M=null,P=null,L=1,N="",z={},V=!1,B=null,ie=Gi("campus-comment-owner",null);typeof ie!="string"&&(ie=crypto.randomUUID(),vi("campus-comment-owner",ie));let G=We("dialog","campus-dialog");G.id="campus-dialog",G.innerHTML=`<div class="dialog-heading"><div><small>YOUR CAMPUS</small><h2>\u6821\u56ED\u5DE5\u5177</h2></div><button id="close-campus-tools" class="icon-button" data-ui-icon="close" aria-label="\u5173\u95ED\u6821\u56ED\u5DE5\u5177"></button></div>
    <nav class="tools-tabs" aria-label="\u6821\u56ED\u5DE5\u5177\u5206\u7C7B"><button data-tools-tab="layers">\u56FE\u5C42</button><button data-tools-tab="favorites">\u6536\u85CF</button><button data-tools-tab="comments">\u7559\u8A00</button><button data-tools-tab="about">\u8D44\u6599</button></nav>
    <section data-tools-panel="layers"><h3>\u5730\u56FE\u5185\u5BB9</h3><div id="scene-layers" class="layer-grid"></div><h3>\u6821\u56ED\u751F\u6D3B\u5730\u70B9</h3><div class="small-actions"><button id="all-place-categories">\u5168\u9009</button><button id="no-place-categories">\u6E05\u7A7A</button></div><div id="place-category-layers" class="layer-grid"></div><p class="tool-note">\u56FE\u5C42\u4E0E\u7C7B\u522B\u4F1A\u4FDD\u5B58\u5728\u8FD9\u53F0\u8BBE\u5907\u3002\u641C\u7D22\u7ED3\u679C\u548C\u5730\u56FE\u540D\u79F0\u540C\u6B65\u7B5B\u9009\u3002</p></section>
    <section data-tools-panel="favorites" hidden><h3>\u6211\u7684\u6821\u56ED\u6E05\u5355</h3><p class="tool-note">\u6536\u85CF\u5EFA\u7B51\u6216\u5730\u70B9\uFF0C\u4E0B\u6B21\u53EF\u76F4\u63A5\u5B9A\u4F4D\uFF1B\u4FDD\u5B58\u5728\u5F53\u524D\u8BBE\u5907\u3002</p><div id="favorite-list"></div></section>
    <section data-tools-panel="comments" hidden><div class="comment-context"><h3 id="comment-context-title">\u5168\u90E8\u5730\u70B9\u7559\u8A00</h3><button id="all-comments">\u67E5\u770B\u5168\u90E8</button></div><p class="tool-note">\u7559\u8A00\u4FDD\u5B58\u5728\u672C\u5730\u9884\u89C8\u670D\u52A1\uFF0C\u8FDE\u63A5\u540C\u4E00\u670D\u52A1\u7684\u6D4F\u89C8\u5668\u53EF\u89C1\u3002</p><div id="comment-list"></div><div class="comment-pagination"><button id="comments-prev">\u4E0A\u4E00\u9875</button><span id="comments-page"></span><button id="comments-next">\u4E0B\u4E00\u9875</button></div>
    <form id="comment-form"><label>\u6635\u79F0<input id="comment-author" maxlength="30" required autocomplete="nickname"></label><label>\u7559\u8A00\u6216\u66F4\u6B63<textarea id="comment-body" rows="3" minlength="2" maxlength="1200" required placeholder="\u5206\u4EAB\u5730\u70B9\u4F53\u9A8C\uFF0C\u6216\u8BF4\u660E\u9700\u8981\u66F4\u6B63\u7684\u4FE1\u606F"></textarea></label><div id="reply-context" hidden></div><label>\u9644\u56FE\uFF08\u53EF\u9009\uFF0C\u538B\u7F29\u540E\u6700\u591A 500KB\uFF09<input id="comment-image" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="submit" id="send-comment">\u53D1\u5E03\u7559\u8A00</button><p id="comment-status" role="status"></p></form></section>
    <section data-tools-panel="about" hidden><h3>\u6570\u636E\u4E0E\u79BB\u7EBF</h3><p id="place-data-date"></p><div class="tool-actions"><button id="refresh-places">\u5237\u65B0\u5730\u70B9\u6570\u636E</button><button id="download-offline">\u4FDD\u5B58\u79BB\u7EBF\u5730\u56FE</button><button id="install-campus" hidden>\u5B89\u88C5\u5230\u8BBE\u5907</button></div><p id="offline-state" role="status"></p><p>\u5EFA\u7B51\u4F53\u91CF\u6CBF\u7528\u5DF2\u767B\u8BB0\u6A21\u578B\u3002\u5730\u70B9\u6765\u81EA OpenStreetMap \u516C\u5F00\u8BB0\u5F55\uFF0C\u5E97\u94FA\u3001\u697C\u5C42\u3001\u8425\u4E1A\u65F6\u95F4\u4E0E\u901A\u884C\u60C5\u51B5\u53EF\u80FD\u53D8\u5316\u3002</p><p>\u672C\u6B21\u6750\u8D28\u3001\u65E5\u5149\u3001\u53CD\u5C04\u548C\u5FAE\u8868\u9762\u53C2\u6570\u7528\u4E8E\u89C6\u89C9\u8868\u73B0\uFF1B\u5730\u56FE\u8F6E\u5ED3\u53CA\u7167\u7247\u4F30\u7B97\u4E0D\u7B49\u4E8E\u5B9E\u6D4B\u5EFA\u7B51\u3002</p><p>\u5B9A\u4F4D\u53EA\u5728\u70B9\u51FB\u540E\u7533\u8BF7\uFF0C\u5750\u6807\u4FDD\u7559\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u5185\u5B58\u3002\u5173\u95ED\u5B9A\u4F4D\u5373\u505C\u6B62\u8DDF\u8E2A\u3002\u5E94\u7528\u4E0D\u52A0\u8F7D\u7B2C\u4E09\u65B9\u7EDF\u8BA1\u811A\u672C\u3002</p><p>\u6821\u56ED\u4EA4\u6D41\u8BF7\u4F7F\u7528\u4F1A\u540C\u91CC\u7684\u6821\u56ED\u793E\u533A\u3002</p><p><a href="https://github.com/HaoTian22/BNBU-Map" target="_blank" rel="noreferrer">\u53C2\u8003\u9879\u76EE BNBU-Map</a> \xB7 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">\xA9 OpenStreetMap contributors \xB7 ODbL</a></p></section>`,document.body.appendChild(G),ag(G.querySelector('[data-tools-panel="about"]'));let oe=We("section");oe.innerHTML='<h3>\u5730\u70B9\u81EA\u52A8\u66F4\u65B0</h3><label class="check"><input id="auto-refresh-places" type="checkbox">\u6BCF\u5929 03:10 \u66F4\u65B0\u5730\u70B9</label><p id="maintenance-state" class="tool-note">\u672C\u5730\u670D\u52A1\u8FD0\u884C\u671F\u95F4\u751F\u6548\uFF0C\u66F4\u65B0\u65F6\u95F4\u4E3A\u5317\u4EAC\u65F6\u95F4\u3002</p>',G.querySelector('[data-tools-panel="about"]').append(oe);let le=d("#auto-refresh-places");function Me(w){if(w.managed){le.disabled=!0,le.closest("label").hidden=!0,d("#refresh-places").hidden=!0,oe.querySelector("h3").textContent="\u5730\u70B9\u6570\u636E",d("#maintenance-state").textContent="\u5730\u70B9\u8D44\u6599\u7531\u7AD9\u70B9\u7EDF\u4E00\u7EF4\u62A4\uFF0C\u66F4\u65B0\u65E5\u671F\u89C1\u4E0A\u65B9\u8BF4\u660E\u3002";return}le.checked=w.enabled,d("#maintenance-state").textContent=w.enabled?`\u4E0B\u6B21 ${new Date(w.nextAt).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai"})}\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09 \xB7 \u672C\u5730\u670D\u52A1\u8FD0\u884C\u671F\u95F4\u751F\u6548${w.lastError?" \xB7 \u4E0A\u6B21\u5931\u8D25\uFF0C\u5C06\u91CD\u8BD5":""}`:"\u81EA\u52A8\u66F4\u65B0\u5DF2\u5173\u95ED\u3002\u53EF\u4EE5\u968F\u65F6\u624B\u52A8\u5237\u65B0\u5730\u70B9\u3002"}fetch("/api/maintenance").then(w=>w.ok?w.json():null).then(w=>{w&&Me(w)}).catch(()=>{}),le.onchange=async()=>{le.disabled=!0;try{let w=await fetch("/api/maintenance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:le.checked})});if(!w.ok)throw Error();Me(await w.json())}catch{le.checked=!le.checked,Oe("\u65E0\u6CD5\u4FDD\u5B58\u81EA\u52A8\u66F4\u65B0\u8BBE\u7F6E")}finally{le.disabled=!1}};let Ae=We("label","field","\u7559\u8A00\u6392\u5E8F"),Ne=We("select");Ne.id="comment-sort",Ne.setAttribute("aria-label","\u7559\u8A00\u6392\u5E8F");for(let[w,O]of[["newest","\u6700\u65B0\u53D1\u5E03"],["oldest","\u6700\u65E9\u53D1\u5E03"],["popular","\u6700\u591A\u8D5E\u540C"]])Ne.add(new Option(O,w));Ae.append(Ne),d("#comment-list").before(Ae),Ne.onchange=()=>{L=1,$e()};let Ve=We("button","","\u53D6\u6D88\u7F16\u8F91");Ve.id="cancel-comment-edit",Ve.type="button",Ve.hidden=!0,d("#comment-form").prepend(Ve);let fe=We("button","","\u9884\u89C8\u7559\u8A00");fe.type="button",fe.id="preview-comment";let q=We("div","comment-preview");q.hidden=!0,q.setAttribute("aria-label","\u7559\u8A00\u9884\u89C8"),fe.onclick=()=>{q.hidden=!q.hidden,$c(q,d("#comment-body").value),fe.textContent=q.hidden?"\u9884\u89C8\u7559\u8A00":"\u6536\u8D77\u9884\u89C8"},d("#send-comment").before(fe,q);let Z=We("div","small-actions");for(let w of["\u{1F44D}","\u2764\uFE0F","\u{1F60A}","\u{1F4CD}"]){let O=We("button","",w);O.type="button",O.setAttribute("aria-label","\u63D2\u5165 "+w),O.onclick=()=>{let j=d("#comment-body");j.setRangeText(w,j.selectionStart,j.selectionEnd,"end"),j.dispatchEvent(new Event("input")),j.focus()},Z.append(O)}d("#comment-image").parentElement.before(Z);let me=We("small","tool-note","\u652F\u6301 **\u52A0\u7C97**\u3001`\u4EE3\u7801`\u3001> \u5F15\u7528\u548C [\u6587\u5B57](https://\u94FE\u63A5)");d("#comment-body").after(me);function we(){B=null,Ve.hidden=!0,d("#send-comment").textContent="\u53D1\u5E03\u7559\u8A00",d("#comment-body").value=Gi("campus-draft-"+(N||"campus"),"")}Ve.onclick=we;let _e;function Oe(w){let O=d("#map-toast");O.textContent=w,O.hidden=!1,clearTimeout(_e),_e=setTimeout(()=>O.hidden=!0,4500)}function dt(w="layers"){for(let O of G.querySelectorAll("[data-tools-tab]"))O.setAttribute("aria-pressed",String(O.dataset.toolsTab===w));for(let O of G.querySelectorAll("[data-tools-panel]"))O.hidden=O.dataset.toolsPanel!==w;G.open||G.showModal(),w==="favorites"&&ze(),w==="comments"&&$e()}d("#close-campus-tools").onclick=()=>G.close(),G.addEventListener("click",w=>{w.target===G&&G.close()}),d("#open-campus-tools").onclick=()=>dt(),G.querySelectorAll("[data-tools-tab]").forEach(w=>w.onclick=()=>dt(w.dataset.toolsTab));for(let[w,O]of Object.entries({buildings:"\u4E09\u7EF4\u5EFA\u7B51",roads:"\u9053\u8DEF\u4E0E\u94FA\u88C5",water:"\u6C34\u9762",green:"\u7EFF\u5730\u4E0E\u8FD0\u52A8\u573A",ground:"\u6821\u56ED\u5E95\u56FE",labels:"\u540D\u79F0\u6807\u6CE8"})){let j=We("label","layer-choice"),ee=We("input");ee.type="checkbox",ee.checked=x[w],ee.dataset.layer=w,ee.onchange=()=>{x[w]=ee.checked,w==="labels"&&(d("#show-labels").checked=ee.checked),vi("campus-layers",x),c(x),u(),h()},j.append(ee,document.createTextNode(O)),d("#scene-layers").append(j)}d("#show-labels").checked=x.labels,d("#show-labels").addEventListener("change",()=>{x.labels=d("#show-labels").checked,d('#scene-layers input[data-layer="labels"]').checked=x.labels,vi("campus-layers",x),u(),h()});function U(){vi("campus-place-categories",[...E]),d("#place-category-layers").querySelectorAll("input").forEach(w=>w.checked=E.has(w.value)),u(),h()}for(let[w,O]of li.filter(([j])=>j!=="all")){let j=We("label","layer-choice"),ee=We("input");ee.type="checkbox",ee.value=w,ee.checked=E.has(w),ee.onchange=()=>{ee.checked?E.add(w):E.delete(w),U()},j.append(ee,document.createTextNode(O)),d("#place-category-layers").append(j)}d("#all-place-categories").onclick=()=>{li.forEach(([w])=>{w!=="all"&&E.add(w)}),U()},d("#no-place-categories").onclick=()=>{E.clear(),U()};let lt=[...new Set(f.map(w=>w.floor).filter(Boolean))].sort((w,O)=>w.localeCompare(O,void 0,{numeric:!0}));for(let w of lt){let O=We("option","",w+" \u5C42");O.value=w,d("#place-floor").append(O)}function ze(){let w=d("#favorite-list");w.replaceChildren();let O=m.filter(j=>p.has(j.id));O.length||w.append(We("p","tool-note","\u8FD8\u6CA1\u6709\u6536\u85CF\u3002\u6253\u5F00\u4EFB\u610F\u5EFA\u7B51\u6216\u5730\u70B9\uFF0C\u70B9\u51FB\u201C\u6536\u85CF\u201D\u3002"));for(let j of O){let ee=We("div","favorite-row"),ne=We("button","",j.display_name||j.name),X=We("button","","\u79FB\u9664");ne.onclick=()=>{G.close(),r(j)},X.onclick=()=>{p.delete(j.id),vi("campus-favorites",[...p]),ze(),A?.id===j.id&&Y()},ee.append(ne,X),w.append(ee)}}function Y(){let w=d("#favorite-place");w&&A&&(nn(w,"star",p.has(A.id)?"\u5DF2\u6536\u85CF":"\u6536\u85CF"),w.setAttribute("aria-pressed",String(p.has(A.id))))}async function re(w=A){let O=l();O.place=w?.id||O.place;let j=window.location.origin+window.location.pathname+vo(O);try{await navigator.clipboard.writeText(j),Oe("\u89C6\u89D2\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u6253\u5F00\u94FE\u63A5\u53EF\u6062\u590D\u4F4D\u7F6E\u4E0E\u5730\u70B9")}catch{let ee=We("input","share-fallback");ee.readOnly=!0,ee.value=j,d("#detail-body").prepend(ee),ee.select(),Oe("\u8BF7\u590D\u5236\u9009\u4E2D\u7684\u89C6\u89D2\u94FE\u63A5")}}function Be(w,O){A=w;let j=We("div","place-actions"),ee=We("button","","\u6536\u85CF");ee.id="favorite-place",ee.onclick=()=>{p.has(w.id)?p.delete(w.id):p.add(w.id),vi("campus-favorites",[...p]),Y()};let ne=nn(We("button"),"share","\u5206\u4EAB\u89C6\u89D2");ne.onclick=()=>re(w);let X=nn(We("button"),"comment",`\u7559\u8A00${z[w.id]?" \xB7 "+z[w.id]:""}`);X.dataset.commentPlace=w.id,X.onclick=()=>{N=w.id,L=1,P=null,we(),dt("comments")},j.append(ee,ne),d("#detail-body").prepend(j),Y();let be=f.filter(De=>De.building_id===w.id&&De.id!==w.id);if(be.length&&O){let De=We("button","inside-places",`\u67E5\u770B\u697C\u5185 ${be.length} \u5904\u5730\u70B9`);De.onclick=()=>O(w.id),j.after(De)}}let he=0;function Pe(w){z=w,document.querySelectorAll("[data-comment-place]").forEach(O=>{let j=w[O.dataset.commentPlace];nn(O,"comment",`\u7559\u8A00${j?" \xB7 "+j:""}`)})}fetch("/api/community?counts=1").then(w=>w.ok?w.json():null).then(w=>{w&&Pe(w.counts)}).catch(()=>{});async function $e(){let w=++he,O=m.find(ee=>ee.id===N);d("#comment-context-title").textContent=O?(O.display_name||O.name)+" \xB7 \u7559\u8A00":N==="campus"?"\u6821\u56ED\u7559\u8A00":"\u5168\u90E8\u5730\u70B9\u7559\u8A00",B||(d("#comment-body").value=Gi("campus-draft-"+(N||"campus"),"")),d("#reply-context").hidden=!P;let j=d("#comment-list");j.textContent="\u6B63\u5728\u8BFB\u53D6\u7559\u8A00\u2026";try{let ee=await fetch(`/api/community?place=${encodeURIComponent(N)}&page=${L}&sort=${Ne.value}`,{headers:{"X-Campus-Owner":ie}});if(!ee.ok)throw Error("\u7559\u8A00\u670D\u52A1\u6682\u4E0D\u53EF\u7528");let ne=await ee.json();if(w!==he)return;Pe(ne.counts),j.replaceChildren(),ne.comments.length||j.append(We("p","tool-note","\u8FD8\u6CA1\u6709\u7559\u8A00\uFF0C\u5199\u4E0B\u7B2C\u4E00\u6761\u4F53\u9A8C\u6216\u66F4\u6B63\u3002"));for(let X of ne.comments){let be=We("article","comment-card");be.append(We("strong","",X.author),We("time","",new Date(X.createdAt).toLocaleString("zh-CN"))),X.parentId&&be.append(We("blockquote","reply-label",X.parent?`${X.parent.author}\uFF1A${X.parent.body}`:"\u539F\u7559\u8A00\u5DF2\u9690\u85CF")),X.updatedAt&&be.append(We("small","reply-label","\u5DF2\u7F16\u8F91"));let De=We("div","comment-content");if($c(De,X.body),be.append(De),X.image){let fn=We("img");fn.src=X.image,fn.alt="\u7559\u8A00\u9644\u56FE",fn.loading="lazy",be.append(fn)}let ot=We("div","small-actions"),et=m.find(fn=>fn.id===X.placeId),dn=We("button","",`\u8D5E\u540C ${X.likes||0}`);if(dn.setAttribute("aria-pressed",String(X.liked)),dn.onclick=async()=>{dn.disabled=!0;try{await Je({action:"like",id:X.id,owner:ie}),await $e()}catch{Oe("\u6682\u65F6\u65E0\u6CD5\u70B9\u8D5E")}finally{dn.disabled=!1}},ot.append(dn),et){let fn=We("button","",et.display_name||et.name);fn.onclick=()=>{G.close(),r(et)},ot.append(fn)}let An=We("button","","\u56DE\u590D");if(An.onclick=()=>{we(),P=X.id,N=X.placeId,d("#comment-context-title").textContent=(et?.display_name||et?.name||"\u6821\u56ED")+" \xB7 \u7559\u8A00",d("#comment-body").value=Gi("campus-draft-"+N,""),d("#reply-context").hidden=!1,d("#reply-context").textContent=`\u56DE\u590D ${X.author}\uFF08\u70B9\u51FB\u53D6\u6D88\uFF09`,d("#comment-body").focus()},ot.append(An),X.mine){let fn=We("button","","\u7F16\u8F91");fn.onclick=()=>{B=X.id,P=null,Ve.hidden=!1,d("#reply-context").hidden=!0,d("#send-comment").textContent="\u4FDD\u5B58\u4FEE\u6539",d("#comment-author").value=X.author,d("#comment-body").value=X.body,d("#comment-body").focus()},ot.append(fn);let kn=We("button","","\u9690\u85CF");kn.onclick=async()=>{kn.disabled=!0;try{await Je({action:"hide",id:X.id,owner:ie}),B===X.id&&we(),await $e()}catch{Oe("\u9690\u85CF\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"),kn.disabled=!1}},ot.append(kn)}be.append(ot),j.append(be)}d("#comments-page").textContent=`${L} / ${Math.max(1,Math.ceil(ne.total/20))}`,d("#comments-prev").disabled=L<=1,d("#comments-next").disabled=L*20>=ne.total}catch{w===he&&(j.textContent="\u7559\u8A00\u670D\u52A1\u6682\u4E0D\u53EF\u7528\u3002\u6587\u5B57\u4F1A\u4FDD\u7559\u4E3A\u8349\u7A3F\uFF0C\u8054\u7F51\u540E\u53EF\u518D\u6B21\u53D1\u5E03\u3002")}}async function Je(w){let O=await fetch("/api/community",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)}),j=await O.json();if(!O.ok)throw Error(j.error||"\u53D1\u5E03\u5931\u8D25");return j}async function D(w){if(!w)return null;if(!["image/png","image/jpeg","image/webp"].includes(w.type)||w.size>8*1024*1024)throw Error("\u8BF7\u9009\u62E9 8MB \u4EE5\u5185\u7684 PNG\u3001JPEG \u6216 WebP");let O=await createImageBitmap(w),j=Math.min(1,1200/Math.max(O.width,O.height)),ee=document.createElement("canvas");ee.width=Math.round(O.width*j),ee.height=Math.round(O.height*j),ee.getContext("2d").drawImage(O,0,0,ee.width,ee.height),O.close();let ne=ee.toDataURL("image/jpeg",.8);if(ne.length>7e5)throw Error("\u538B\u7F29\u540E\u7684\u56FE\u7247\u4ECD\u8FC7\u5927\uFF0C\u8BF7\u88C1\u526A\u540E\u518D\u8BD5");return ne}d("#comment-author").value=Gi("campus-nickname",""),d("#comment-body").addEventListener("input",()=>{B||vi("campus-draft-"+(N||"campus"),d("#comment-body").value),q.hidden||$c(q,d("#comment-body").value)}),d("#reply-context").onclick=()=>{P=null,d("#reply-context").hidden=!0},d("#comment-form").onsubmit=async w=>{w.preventDefault(),d("#send-comment").disabled=!0,d("#comment-status").textContent="\u6B63\u5728\u4FDD\u5B58\u2026";try{let O=d("#comment-body").value,j=d("#comment-author").value,ee=await D(d("#comment-image").files[0]);await Je(B?{action:"edit",id:B,author:j,body:O,owner:ie,...ee?{image:ee}:{}}:{placeId:N||"campus",author:j,body:O,owner:ie,parentId:P,image:ee}),B=null,Ve.hidden=!0,d("#send-comment").textContent="\u53D1\u5E03\u7559\u8A00",q.hidden=!0,fe.textContent="\u9884\u89C8\u7559\u8A00",vi("campus-nickname",j),vi("campus-draft-"+(N||"campus"),""),d("#comment-body").value="",d("#comment-image").value="",P=null,d("#comment-status").textContent="\u7559\u8A00\u5DF2\u53D1\u5E03",L=1,await $e()}catch(O){d("#comment-status").textContent=O.message+"\uFF0C\u6587\u5B57\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002"}finally{d("#send-comment").disabled=!1}},d("#all-comments").onclick=()=>{N="",L=1,P=null,we(),$e()},d("#comments-prev").onclick=()=>{L--,$e()},d("#comments-next").onclick=()=>{L++,$e()};let v=f.filter(w=>w.nearby);d("#place-data-date").textContent=`\u6821\u56ED ${f.length-v.length} \u6761\uFF1B\u5468\u8FB9 ${v.length} \u6761\u3002\u5730\u70B9\u8BB0\u5F55\u66F4\u65B0\u4E8E ${e.sourceTimestamp?.slice(0,10)||"\u672A\u77E5\u65E5\u671F"}${e.referenceCounts?`\uFF0C\u5DF2\u5408\u5E76\u6E90\u5730\u56FE ${e.referenceCounts.sourcePointRecords} \u6761\u6807\u6CE8\uFF0C\u8865\u5145 ${e.referenceCounts.added} \u5904\u5730\u70B9`:""}\u3002`;let F=We("a","","\u6D4F\u89C8\u6587\u5B57\u7248\u5730\u70B9\u76EE\u5F55 \u2197");F.hidden=!0,F.href="/campus-map/data/processed/campus-places.json",F.target="_blank",F.rel="noreferrer",d("#place-data-date").after(F);for(let[w,O]of[["/campus-map/viewer/privacy.html","\u9690\u79C1\u4E0E\u672C\u673A\u6570\u636E"],["/campus-map/data/processed/campus-places.json","\u6821\u56ED\u5730\u70B9\u6570\u636E JSON"],["/campus-map/data/processed/surroundings.json","\u5468\u8FB9\u5730\u56FE\u4E0E\u5730\u70B9 JSON"]]){let j=We("p"),ee=We("a","",O);ee.href=w,ee.target="_blank",ee.rel="noreferrer",j.append(ee),F.after(j)}d("#refresh-places").onclick=async()=>{let w=d("#refresh-places");w.disabled=!0;try{let O=await fetch("/api/places-refresh",{method:"POST"}),j=await O.json();if(!O.ok)throw Error(j.error);Oe(`\u5DF2\u66F4\u65B0 ${j.count} \u6761\u5730\u70B9\uFF0C\u5237\u65B0\u9875\u9762\u540E\u751F\u6548`),d("#place-data-date").textContent=`${j.count} \u6761\u8BB0\u5F55 \xB7 ${j.sourceTimestamp?.slice(0,10)} \xB7 \u5237\u65B0\u9875\u9762\u5E94\u7528`}catch{Oe("\u66F4\u65B0\u5931\u8D25\uFF0C\u7EE7\u7EED\u4F7F\u7528\u5DF2\u4FDD\u5B58\u7684\u5730\u70B9\u6570\u636E")}finally{w.disabled=!1}};let J;d("#download-offline").onclick=async()=>{let w=d("#download-offline");w.disabled=!0;try{J??(J=await navigator.serviceWorker.register("/campus-map/viewer/offline-worker.js",{scope:"/"})),await navigator.serviceWorker.ready,await new Promise((O,j)=>{let ee=new MessageChannel,ne=setTimeout(()=>j(Error("\u4E0B\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5")),9e4);ee.port1.onmessage=X=>{X.data.error?(clearTimeout(ne),j(Error(X.data.error))):X.data.done?(clearTimeout(ne),O()):d("#offline-state").textContent=`\u79BB\u7EBF\u8D44\u6E90 ${X.data.complete} / ${X.data.total}`},J.active.postMessage({type:"download-campus"},[ee.port2])}),d("#offline-state").textContent="\u79BB\u7EBF\u5730\u56FE\u5DF2\u4FDD\u5B58\uFF1A\u5EFA\u7B51\u3001\u5730\u70B9\u4E0E\u4E09\u6863\u6A21\u578B\u3002\u7559\u8A00\u9700\u8981\u8054\u7F51\u4F7F\u7528\u3002"}catch(O){d("#offline-state").textContent=O.message}finally{w.disabled=!1}};let te;window.addEventListener("beforeinstallprompt",w=>{w.preventDefault(),te=w,d("#install-campus").hidden=!1}),d("#install-campus").onclick=async()=>{await te?.prompt(),d("#install-campus").hidden=!0};let W=We("button","","\u25CE");W.id="locate-user",W.title="\u6211\u7684\u4F4D\u7F6E",W.setAttribute("aria-label","\u6211\u7684\u4F4D\u7F6E");let ge=We("button","","\u2197");ge.id="share-view",ge.title="\u5206\u4EAB\u5F53\u524D\u89C6\u89D2",ge.setAttribute("aria-label","\u5206\u4EAB\u5F53\u524D\u89C6\u89D2"),ge.onclick=()=>re();let ae=We("button","","\u26F6");ae.title="\u5168\u5C4F\u5730\u56FE",ae.setAttribute("aria-label","\u5168\u5C4F\u5730\u56FE"),ae.onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{Oe("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5168\u5C4F")}},ae.id="fullscreen-map",nn(W,"location",""),nn(ge,"share",""),nn(ae,"fullscreen",""),d(".map-tools").append(W,ge,ae);function xe(){I!==null&&navigator.geolocation.clearWatch(I),I=null,R=null,S=null,W.classList.remove("active"),W.setAttribute("aria-pressed","false"),W.title="\u6211\u7684\u4F4D\u7F6E",window.removeEventListener("deviceorientationabsolute",ye),window.removeEventListener("deviceorientation",ye),M&&(M.visible=!1),u(),h()}function ye(w){let O=w.webkitCompassHeading??(w.absolute&&Number.isFinite(w.alpha)?360-w.alpha:null);O!==null&&(S=O,se())}function se(){!M||!R||(M.position.set(R[0],1,-R[1]),M.rotation.y=-(S??0)*Math.PI/180,M.getObjectByName("heading").visible=Number.isFinite(S),M.visible=!0,h())}let pe=null,Le=!1;sg({button:W,geolocation:window.parent.navigator.geolocation,secure:window.isSecureContext,lifecycle:window,onClear:()=>{xe(),pe&&(o(pe),pe=null)},onState:w=>parent.postMessage({type:"huitongli-map-location",...w},window.location.origin),onPosition:w=>{Le=!0,pe=l();let O=Ti(w.coords.longitude,w.coords.latitude);if(Math.hypot(...O)>5e3)return!1;if(R=O,S=Number.isFinite(w.coords.heading)?w.coords.heading:S,!M){M=new Dt,M.name="Local GPS accuracy marker";let j=new it(new Us(2,16,8),new Gt({color:2522093,depthTest:!1})),ee=new it(new Oa(.97,1,64),new Gt({color:3770358,transparent:!0,opacity:.55,side:Mn,depthTest:!1}));ee.rotation.x=-Math.PI/2,ee.name="accuracy";let ne=new it(new Ra(2,5,3),new Gt({color:2522093,depthTest:!1}));ne.name="heading",ne.rotation.x=-Math.PI/2,ne.position.z=-5,M.add(j,ee,ne),M.renderOrder=10,s.add(M)}return M.getObjectByName("accuracy").scale.setScalar(Math.max(3,w.coords.accuracy)),se(),W.classList.add("active"),W.title=`\u6211\u7684\u4F4D\u7F6E \xB7 \u7CBE\u5EA6\u7EA6 ${Math.round(w.coords.accuracy)} \u7C73`,a({centroid:O,phase:"all",labelHeight:0},500),u(),!0}});function Ee(){if(V||Le)return;let w=l();vi("campus-view",w),history.replaceState(null,"",vo(w))}async function de({preserveCamera:w=!1}={}){new URLSearchParams(window.location.hash.slice(1)).get("panel")==="comments"&&dt("comments");let O=bo(Ue(),m);if(!O)try{let j=Gi("campus-view",null);j&&(O=bo(vo(j),m))}catch{}if(O){V=!0;try{if(O.place){let j=m.find(ee=>ee.id===O.place);j&&r(j,!O.target&&!w)}O.target&&O.position&&!w&&o(O)}finally{V=!1}}}function Ue(){return window.location.hash}return window.addEventListener("hashchange",de),c(x),{addActions:Be,toast:Oe,open:dt,share:re,restore:de,saveView:Ee,clearSelection:()=>A=null,get state(){return{placeCategories:E,favorites:p,location:R,labels:x.labels}},get layers(){return x},get current(){return A},get entries(){return m}}}var lg="20261016-depth2",$r=i=>i.toArray().map(e=>Math.round(e*1e4)).join(","),wb=new C(0,1,0),Zc=i=>{let e=i.geometry,t=e.attributes.position,n=e.index?.count??t.count,s=[];for(let r=0;r<n;r+=3){let a=[0,1,2].map(u=>e.index?e.index.getX(r+u):r+u),o=a.map(u=>new C().fromBufferAttribute(t,u).applyMatrix4(i.matrixWorld)),l=new C().crossVectors(o[1].clone().sub(o[0]),o[2].clone().sub(o[0])),c=l.length()*.5;c<1e-8||s.push({points:o,indices:a,normal:l.normalize(),area:c})}return s};function Eb(i){let e=Zc(i),t=e.map((o,l)=>l),n=new Map,s=o=>t[o]===o?o:t[o]=s(t[o]);e.forEach((o,l)=>{for(let c=0;c<3;c++){let u=[$r(o.points[c]),$r(o.points[(c+1)%3])].sort().join("|");if(n.has(u)){let h=n.get(u);o.normal.dot(e[h].normal)>.9999&&(t[s(l)]=s(h))}else n.set(u,l)}});let r=new Map;e.forEach((o,l)=>{let c=s(l);r.has(c)||r.set(c,[]),r.get(c).push(o)});let a=[];for(let o of r.values()){let l=o[0].normal;if(Math.abs(l.y)>.015)continue;let c=new C(l.z,0,-l.x).normalize(),u=l.dot(o[0].points[0]),h=o.flatMap(x=>x.points),d=h.map(x=>x.dot(c)),f=h.map(x=>x.y),m=Math.min(...d),_=Math.max(...d),g=Math.min(...f),p=Math.max(...f),b=o.reduce((x,y)=>x+y.area,0);_-m<.3||p-g<.2||Math.abs(b-(_-m)*(p-g))>b*.001||h.some(x=>Math.abs(l.dot(x)-u)>.002)||a.push({normal:l,tangent:c,distance:u,left:m,right:_,bottom:g,top:p,triangles:o})}return a}function Mo(){let i=[],e=(r,a,o)=>i.push(...r.toArray(),...a.toArray(),...o.toArray()),t=(r,a,o,l)=>{e(r,a,o),e(r,o,l)};function n(r,a,o,l,c,u,h,d=.008){if(o-a<=0||c-l<=0)return;let f=Math.min(d,(o-a)*.22,(c-l)*.22,(h-u)*.3),m=(x,y,E)=>r.tangent.clone().multiplyScalar(x).addScaledVector(wb,y).addScaledVector(r.normal,r.distance+E),_=(x,y)=>[[a+x,l+x],[o-x,l+x],[o-x,c-x],[a+x,c-x]].map(([E,A])=>m(E,A,y)),g=_(0,u),p=_(0,h-f),b=_(f,h);t(b[0],b[1],b[2],b[3]),t(g[3],g[2],g[1],g[0]);for(let x=0;x<4;x++){let y=(x+1)%4;t(g[x],g[y],p[y],p[x]),t(p[x],p[y],b[y],b[x])}}function s(){let r=new gt;return r.setAttribute("position",new rt(i,3)),r.computeVertexNormals(),r.computeBoundingBox(),r.computeBoundingSphere(),r}return{tri:e,quad:t,bar:n,geometry:s,get triangles(){return i.length/9}}}function cg(i,e){if(i.userData.photoArchitecture)return i.userData.photoArchitecture;let t={version:lg,lod:e,windowBands:0,mullions:0,extrudedMeshes:0,roofEdges:0,depthGlazing:0,windowReveals:0,roofAssemblies:0,addedTriangles:0,addedMeshes:0};if(e===2)return i.userData.photoArchitecture=t,t;i.updateMatrixWorld(!0);let n=new Dt;n.name="Photo referenced architectural finishes",n.matrix.copy(i.matrixWorld).invert(),n.matrixAutoUpdate=!1;let s=new Wt({name:"Photo detail aluminum mullion - section estimate",color:5466994,roughness:.32,metalness:.65}),r=new Wt({name:"Photo detail roof edge stone - section estimate",color:13488325,roughness:.74}),a=new Map;function o(l,c,u,h){if(!l.triangles)return;let d=new it(l.geometry(),c);d.name=h,d.userData={...u,kind:"building_detail",photo_finish:lg,detail_status:"photo_estimated",detail_role:h,source_pages:[h.startsWith("Library")?"https://www.bnbu.edu.cn/en/info/1058/11125.htm":"https://www.bnbu.edu.cn/en/info/1058/11128.htm"],dimension_status:"Sections, pitch and finish are visual estimates on existing registered geometry."},n.add(d),t.addedMeshes++,t.addedTriangles+=l.triangles}return i.traverse(l=>{if(!l.isMesh||Array.isArray(l.material))return;let c=l.material.name,u=ls(l);if(c==="Photo-observed glazing bands - opaque approximation"||/^Library (crown edge\d|podium) glass/.test(c)){let m=Eb(l);if(!m.length)return;let _=l.geometry.clone(),g=new Float32Array(_.attributes.position.count*2),p=new Float32Array(_.attributes.position.count*4),b=Mo(),x=Mo();for(let y of m){let E=c.startsWith("Photo-observed"),A=y.right-y.left,I=y.top-y.bottom,R=c.includes("podium"),S=E?Math.max(1,Math.round(A/.78)):R?Math.max(1,Math.round(A/1.6)):e===0?24:12,M=E?I>2?2:1:R?1:e===0?4:2;for(let L of y.triangles)for(let N=0;N<3;N++){let z=L.points[N],V=L.indices[N],B=z.dot(y.tangent)-y.left;g[V*2]=B/A*S,g[V*2+1]=(z.y-y.bottom)/I*M,p.set([B,z.y-.35,E?4.68:10.2,3.8],V*4)}if(t.depthGlazing++,!E)continue;t.windowBands++;let P=e===0?.042:.055;b.bar(y,y.left,y.right,y.bottom,y.bottom+P,.005,.1),b.bar(y,y.left,y.right,y.top-P,y.top,.005,.1);for(let L of[y.left,y.right-P])b.bar(y,L,L+P,y.bottom,y.top,.005,.1);if(e===0)for(let L=1;L<S;L++){let N=y.left+A*L/S;b.bar(y,N-P/2,N+P/2,y.bottom,y.top,.008,.095),t.mullions++}e===0&&M===2&&b.bar(y,y.left,y.right,y.bottom+I*.55-.02,y.bottom+I*.55+.02,.008,.095),x.bar(y,y.left-.08,y.right+.08,y.top,y.top+.14,-.015,.32,.012),x.bar(y,y.left-.075,y.left,y.bottom,y.top,-.015,.22,.006),x.bar(y,y.right,y.right+.075,y.bottom,y.top,-.015,.22,.006),t.windowReveals++}if(_.setAttribute("campusPaneUv",new ut(g,2)),_.setAttribute("campusInterior",new ut(p,4)),l.geometry=_,!a.has(l.material)){let y=l.material.clone();y.userData={...y.userData,registeredPaneUv:!0,interiorDepthProxy:!0},a.set(l.material,y)}l.material=a.get(l.material),o(b,s,u,"Window band jambs, headers and narrow mullions"),o(x,r,u,"Teaching window heads and recessed jamb returns")}if(c==="Photo-observed circular skylight - flat coverage estimate"&&u.building_id==="way/1215983507"){let m=Zc(l),_=m.flatMap(S=>S.points),g=new Ot().setFromPoints(_),p=g.getCenter(new C),b=(g.max.x-g.min.x)/2,x=l.geometry.clone(),y=new Float32Array(x.attributes.position.count*4),E=new Float32Array(x.attributes.position.count*2),A=Mo();for(let S of m)for(let M=0;M<3;M++){let P=S.points[M],L=S.indices[M];y.set([P.x-p.x+b,p.z-P.z+b,2*b,2*b],L*4),E.set([(P.x-p.x)/1.5,(P.z-p.z)/1.5],L*2)}let I=e===0?48:24,R=(S,M,P)=>new C(p.x+S*Math.cos(M),P,p.z+S*Math.sin(M));for(let S=0;S<I;S++){let M=S/I*Math.PI*2,P=(S+1)/I*Math.PI*2,L=p.y+.19;A.quad(R(b,M,L),R(b,P,L),R(b+.22,P,L),R(b+.22,M,L)),A.quad(R(b,M,p.y),R(b,P,p.y),R(b,P,L),R(b,M,L)),A.quad(R(b+.22,P,p.y),R(b+.22,M,p.y),R(b+.22,M,L),R(b+.22,P,L))}x.setAttribute("campusInterior",new ut(y,4)),x.setAttribute("campusPaneUv",new ut(E,2)),l.geometry=x,l.material=l.material.clone(),l.material.userData={...l.material.userData,registeredPaneUv:!0,interiorDepthProxy:!0,skylightDepthProxy:!0},o(A,r,u,"Library circular skylight curb"),t.roofAssemblies++,t.depthGlazing++}if(c==="Photo-observed PV coverage - module count unresolved"){let m=Mo(),_=new Map;for(let g of Zc(l))for(let p=0;p<3;p++){let b=g.points[p],x=g.points[(p+1)%3],y=[$r(b),$r(x)].sort().join("|");_.has(y)?_.delete(y):_.set(y,{a:b,c:x})}for(let{a:g,c:p}of _.values()){let b=p.clone().sub(g).normalize(),x=new C(-b.z,0,b.x),y={tangent:b,normal:x,distance:g.dot(x)},E=g.dot(b),A=p.dot(b);m.bar(y,Math.min(E,A),Math.max(E,A),g.y-.12,g.y+.035,-.035,.035,.005)}o(m,s,u,"Teaching PV perimeter frame and support edge"),t.roofAssemblies++}let h=/^Library (crown edge\d|podium) mullion/.test(c),d=/^Library podium fascia/.test(c),f=/^Photo-estimated pale facade edges$/.test(c)&&["way/664082910","way/664082908","way/664082909"].includes(u.id||u.building_id);if(h&&e===0||d||f){let m=Mo(),_=new Map,g=h?.075:d?.1:.08;for(let p of Zc(l)){if(Math.abs(p.normal.y)>.02||f&&Math.min(...p.points.map(x=>x.y))<20)continue;let b=p.points.map(x=>x.clone().addScaledVector(p.normal,g));m.tri(...b);for(let x=0;x<3;x++){let y=p.points[x],E=p.points[(x+1)%3],A=[$r(y),$r(E)].sort().join("|");_.has(A)?_.delete(A):_.set(A,{a:y,c:E,normal:p.normal})}}for(let{a:p,c:b,normal:x}of _.values())m.quad(p,b,b.clone().addScaledVector(x,g),p.clone().addScaledVector(x,g));m.triangles&&(t.extrudedMeshes++,f&&t.roofEdges++,o(m,h?s:r,u,h?"Library mullion returns":d?"Library fascia returns":"Teaching roof coping returns"))}}),i.add(n),i.userData.photoArchitecture=t,t}function ug(i,e,t=[]){let n=new Set(t.map(r=>r.id)),s=of({elements:i.poiElements},e).filter(r=>!n.has(r.id)).map(r=>({...r,phase:"nearby",nearby:!0,sourceTimestamp:i.sourceTimestamp,labelHeight:2}));s.forEach(r=>n.add(r.id));for(let r of i.roads){let a=r.source_url.replace("https://www.openstreetmap.org/","");n.has(a)||(n.add(a),s.push({id:a,kind:"poi",name:r.name,name_en:"",phase:"nearby",nearby:!0,road:!0,category:"transport",centroid:r.point,labelHeight:1,floor:"",tags:{name:r.name,highway:"road"},source_url:r.source_url,sourceTimestamp:i.sourceTimestamp}))}return s}function hg(i){let e=new Dt;e.name="OSM surrounding map in campus ENU";let t={land:["#b8b9a6",-.05,"ground"],green:["#78936c",-.035,"green"],water:["#638a8c",-.02,"water"],roads:["#d6d3bf",-.005,"roads"],paths:["#bcbba7",.008,"roads"],buildings:["#84928b",.025,"buildings"]},n=0;for(let[s,[r,a,o]]of Object.entries(t)){let l=i.layers[s].map(h=>{let d=new Lr(h.outer.map(f=>new ce(...f)));for(let f of h.holes)d.holes.push(new Ds(f.map(m=>new ce(...m))));return new za(d).rotateX(-Math.PI/2).translate(0,a,0)});if(!l.length)continue;let c=Nc(l,!1);l.forEach(h=>h.dispose());let u=new it(c,new Gt({color:r,toneMapped:!1}));u.name="Surrounding "+s,u.userData={contextLayer:o,source:i.source,geometryStatus:"OSM footprint; cartographic road widths"},u.receiveShadow=!0,c.computeBoundingBox(),c.computeBoundingSphere(),e.add(u),n+=c.index.count/3}return{group:e,update(s,r){e.visible=s,e.children.forEach(a=>a.visible=r[a.userData.contextLayer]!==!1)},diagnostics:{sourceTimestamp:i.sourceTimestamp,counts:i.counts,triangles:n,drawBatches:e.children.length,bounds:i.bounds,externalRequestsDuringNavigation:0}}}function dg({width:i,height:e,coarse:t=!1,memory:n,saveData:s=!1}={}){let a=Math.min(i||1/0,e||1/0)<=600||i<=760||t||n>0&&n<=4||s;return{lightweight:a,quality:a?"balanced":"high",mobileTextures:a,loadEnvironment:!s}}var fg={bounds:[-563.5550514865866,-903.9100684978015,685.774100157334,1411.2004056615885],stats:{buildings:79,by_phase:{"1":42,"2":37},height_status:{estimated:45,unknown:13,mixed:7,mapped:14},construction:4,courtyard_rings:10,surfaces:449,mapped_tree_nodes:4,excluded_underground:3,photo_detailed_buildings:38,photo_detailed_surfaces:1,source_building_parts:101,buildings_with_parts:18,elevated_parts:12,uncertain_volume_markers:1},buildings:[{id:"way/1081327620",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[.2678,-532.6801],[-7.7768,-543.6761],[37.9779,-579.6761],[45.5281,-569.6767]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/1201625876",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[294.575,-676.7437],[289.1776,-682.3248],[304.3197,-696.8308],[309.7274,-691.2607]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1201625882",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[499.0864,-493.3833],[494.194,-502.8181],[515.7326,-514.8764],[520.5735,-504.7883]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1201625883",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[482.5852,-496.4733],[492.6695,-501.9655],[521.2615,-443.0424],[508.6948,-435.7675]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1202303549",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[38.4518,-607.0941],[27.8526,-618.4776],[50.0708,-638.875],[58.9086,-625.177]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1206553328",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-14.5132,-380.9066],[-13.0609,-392.7774],[42.8186,-387.0745],[40.7997,-374.0299]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1206553329",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[59.9995,-384.4611],[59.567,-406.7632],[65.9223,-405.7333],[65.8707,-383.5641]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1215697328",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[578.5067,-600.9929],[568.1139,-610.9705],[559.7186,-602.3113],[550.6545,-610.8825],[564.3649,-623.6277],[570.2155,-618.7994],[575.9634,-625.0557],[581.3813,-620.2275],[574.8608,-613.8494],[582.9258,-605.7211]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1215983507",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[280.1231,-662.0494],[295.1203,-643.9328],[315.9064,-627.8205],[343.4184,-594.0568],[331.5932,-583.3379],[269.934,-558.778],[267.4105,-565.1232],[261.076,-581.1024],[248.8393,-594.9998],[246.429,-597.735],[229.0009,-618.6974]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664082908",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[158.3395,-624.9549],[156.712,-624.6891],[155.6099,-631.2779],[158.0202,-631.6211],[156.8563,-639.4501],[195.7924,-644.9421],[218.9583,-648.2196],[224.4485,-648.9946],[226.8897,-649.3379],[227.8579,-641.9297],[229.238,-635.6067],[214.4567,-630.5242],[214.6627,-627.9883],[187.4178,-623.7697],[190.2502,-608.466],[183.5549,-606.5726],[164.3341,-601.1468],[164.0663,-603.0735],[161.1925,-602.7746]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082909",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[127.3036,-576.3314],[124.5225,-575.6559],[122.5551,-582.5104],[125.2539,-583.2745],[123.4513,-589.5975],[164.3341,-601.1468],[183.5549,-606.5726],[190.2502,-608.466],[193.0314,-609.2522],[195.112,-601.9658],[196.9866,-596.9495],[182.8234,-589.6633],[183.7195,-586.8506],[148.811,-577.4718],[151.9114,-566.6418],[131.7121,-560.9281]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082910",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[202.0348,-672.4929],[201.8907,-677.4981],[204.507,-677.3652],[204.9913,-684.7069],[237.4277,-682.0156],[237.5,-697.1974],[244.9577,-702.7119],[264.7447,-680.2434],[263.9822,-665.1392],[255.9684,-665.1393],[255.8344,-663.6997],[241.1871,-664.309],[222.7182,-665.627],[224.4485,-648.9946],[218.9583,-648.2196],[195.7924,-644.9421],[193.7119,-661.2091],[193.9695,-670.688]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082911",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[319.0298,-740.5487],[331.2259,-751.8434],[342.4327,-739.4298],[351.1884,-747.1035],[346.7489,-751.9095],[353.9904,-758.2766],[355.6385,-756.5491],[359.3673,-759.7714],[380.1637,-736.6273],[348.4578,-707.992]],holes:[]}],base_elevation_m:0,height_m:7.6},{id:"way/664082912",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[287.9128,-800.0362],[295.1337,-806.6358],[289.314,-812.9257],[296.8645,-819.8244],[353.9904,-758.2766],[346.7489,-751.9095],[351.1884,-747.1035],[342.4327,-739.4298],[331.2259,-751.8434],[325.2517,-758.4655],[300.3866,-786.0722]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664082913",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[246.3701,-783.8142],[275.2432,-807.3006],[297.2037,-783.4036],[300.3866,-786.0722],[325.2517,-758.4655],[296.1005,-729.83]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/664082915",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[125.5433,-703.112],[147.5042,-722.9776],[192.1989,-763.4065],[226.8187,-725.5789],[160.1734,-665.2735]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/664093255",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[399.5947,-495.0251],[397.8849,-500.0193],[393.2703,-499.9862],[393.6005,-522.0889],[396.2477,-522.0777],[396.001,-541.2238],[400.7494,-535.8198],[400.3781,-518.3901],[396.3918,-518.4235],[396.3608,-514.0937],[409.7412,-517.4597],[415.2211,-518.8327],[424.3578,-526.7722],[427.139,-529.1861],[426.5108,-535.0661],[432.9796,-538.078],[437.6766,-540.0821],[438.1298,-540.1818],[440.8904,-540.7797],[443.9702,-539.0078],[445.8552,-540.7795],[449.0072,-541.5435],[451.4072,-541.0894],[466.9297,-532.3963],[468.2996,-531.0785],[468.7219,-529.3621],[468.5776,-526.184],[473.8308,-525.9734],[473.4595,-511.5447],[470.0089,-511.6223],[470.0704,-503.4722],[429.9605,-502.8643],[414.654,-498.9115]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664093256",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[387.5755,-550.8137],[365.2025,-535.6657],[356.1898,-543.3841],[362.0818,-547.4369],[358.8681,-551.5342],[371.4658,-562.3416],[376.0288,-557.0373],[379.8091,-559.6395],[363.1125,-578.642],[372.4965,-586.7919],[424.3578,-526.7722],[415.2211,-518.8327],[400.7494,-535.8198],[396.001,-541.2238]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093257",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[355.0049,-526.9289],[358.0531,-495.1036],[340.6968,-492.9114],[335.0121,-544.0379],[333.9305,-544.9571],[316.6769,-524.6486],[307.6126,-529.2443],[311.4959,-533.9726],[302.8643,-540.4286],[314.329,-554.7132],[323.1048,-547.1609],[326.741,-551.1141],[312.5266,-563.2731],[321.2204,-573.3055],[356.1898,-543.3841],[365.2025,-535.6657],[378.2735,-524.4922],[369.59,-514.4598]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093258",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[256.4607,-539.1006],[262.9914,-551.8572],[307.6126,-529.2443],[316.6769,-524.6486],[327.4407,-519.1891],[320.91,-506.4437],[307.1281,-513.4203],[313.6683,-483.0898],[296.7034,-478.1071],[284.8794,-524.6935],[277.0923,-528.6469],[263.2584,-504.828],[251.4233,-507.4969],[254.9976,-513.0226],[245.8097,-515.6361],[254.1533,-531.1278],[263.8047,-527.0636],[267.5748,-533.464]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093260",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[255.6256,-492.7913],[270.0251,-466.4471],[254.3169,-456.7581],[230.4824,-498.4724],[225.188,-499.6684],[218.0906,-475.4064],[208.8923,-475.1186],[209.5516,-477.3223],[198.8495,-478.009],[202.9184,-499.7794],[214.8051,-497.2324],[216.0515,-501.7282],[201.1674,-505.0947],[204.1547,-518.1725],[251.4233,-507.4969],[263.2584,-504.828],[279.4712,-501.1624],[276.4736,-488.0847]],holes:[]}],base_elevation_m:0,height_m:26.599999999999998},{id:"way/664093261",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[150.592,-474.7871],[208.8923,-475.1186],[218.0906,-475.4064],[221.3352,-475.4396],[221.5512,-452.5396],[150.8081,-451.8871]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"way/664093272",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[42.6337,-585.0578],[70.3627,-608.7107],[50.8228,-643.1161],[61.9886,-652.9272],[82.4659,-618.0345],[90.871,-608.1015],[51.8732,-574.2389]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093273",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-57.0747,-501.9289],[-18.0052,-535.7253],[-9.0232,-525.0505],[-36.8858,-500.7662],[-16.8309,-466.5824],[-28.1613,-459.1963],[-48.2884,-492.2175]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093274",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[-70.898,-531.473],[-38.668,-561.0172],[-28.8619,-550.4309],[-61.0816,-520.8978]],holes:[]}],base_elevation_m:0,height_m:15.2},{id:"way/664093275",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[15.4507,-516.3578],[54.5203,-550.154],[63.5126,-539.4681],[61.6276,-537.8292],[35.6395,-515.195],[52.0995,-484.311],[40.769,-476.925],[27.9657,-501.5636]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093276",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[118.6406,-528.9701],[106.6096,-521.9385],[95.073,-511.8838],[77.2532,-497.2004],[67.3236,-509.4256],[80.0138,-522.1047],[94.2079,-538.1834],[77.099,-565.9891],[89.4699,-574.7149],[95.815,-564.6601]],holes:[]}],base_elevation_m:0,height_m:25.6},{id:"way/664093277",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[90.7357,-364.0636],[78.4989,-368.2716],[40.7997,-374.0299],[42.8186,-387.0745],[59.9995,-384.4611],[65.8707,-383.5641],[81.1874,-381.2276],[93.6819,-416.4302],[107.608,-411.5356]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093278",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[17.1501,-428.9767],[29.4797,-425.0345],[71.1756,-419.0326],[69.4554,-405.1575],[65.9223,-405.7333],[59.567,-406.7632],[27.09,-412.0342],[15.3887,-376.5547],[1.3596,-381.1392]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093279",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[31.7562,-467.3021],[42.8188,-473.16],[40.769,-476.925],[27.9657,-501.5636],[15.4507,-516.3578],[54.5203,-550.154],[63.5126,-539.4681],[61.6276,-537.8292],[80.0138,-522.1047],[94.2079,-538.1834],[77.099,-565.9891],[89.4699,-574.7149],[95.815,-564.6601],[107.0425,-568.5579],[117.5899,-534.3407],[118.6406,-528.9701],[118.6199,-524.0866],[115.344,-472.5173],[114.396,-428.478],[114.3136,-425.7871],[74.7911,-431.0584],[65.0676,-442.5638],[62.0186,-439.9505],[59.8144,-442.3202],[63.8109,-446.2956],[63.0384,-447.1372],[38.369,-445.0997]],holes:[]}],base_elevation_m:0,display_height_m:.18,height_m:7.6},{id:"way/664093280",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[201.5167,-431.9985],[252.2255,-432.0088],[252.2246,-380.0187],[236.084,-380.019],[236.0841,-389.221],[236.0739,-393.7723],[236.0742,-416.5615],[201.5165,-416.551]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093281",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[248.7939,-334.8167],[198.0751,-334.8949],[198.1685,-385.6116],[214.3194,-385.5893],[214.3091,-381.3259],[214.2571,-350.3201],[248.8147,-350.2532]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093282",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[214.3091,-381.3259],[214.3194,-385.5893],[236.0739,-393.7723],[236.0841,-389.221]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/664093283",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[180.2452,-332.1379],[126.0245,-348.0067],[125.4377,-392.8102],[140.5793,-393.0093],[140.6307,-389.1336],[140.641,-384.8814],[140.4348,-359.7888],[178.8755,-348.5377],[176.9905,-342.1705],[182.7174,-340.4983]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093284",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[140.641,-384.8814],[140.6307,-389.1336],[161.4478,-396.8849],[161.4478,-392.3337]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/664093285",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[126.8801,-435.1109],[177.5889,-435.1215],[177.5986,-383.1314],[161.4477,-383.1316],[161.4478,-392.3337],[161.4478,-396.8849],[161.4378,-419.6741],[126.88,-419.6634]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093286",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[276.1638,-445.3188],[328.1811,-460.4442],[346.7307,-397.4023],[330.5281,-392.6964],[316.6545,-439.8477],[295.518,-433.7023],[299.4525,-420.2922],[284.7744,-416.0292]],holes:[]}],base_elevation_m:0,height_m:25.6},{id:"way/664093287",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[271.1875,-377.4161],[324.4819,-394.1472],[329.3433,-378.8324],[287.3486,-365.6558],[287.5231,-334.1627],[271.4134,-334.0744]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093288",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[373.5238,-474.5176],[427.3439,-489.2661],[444.6777,-426.7335],[429.124,-422.4707],[416.1365,-469.3452],[392.8059,-462.9453],[396.8845,-448.2063],[381.9488,-444.1206]],holes:[]}],base_elevation_m:0,height_m:22.400000000000002},{id:"way/664093289",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[358.4946,-437.322],[371.4938,-441.1199],[380.7428,-409.7485],[418.4527,-420.7324],[422.9948,-405.318],[372.2857,-390.5472]],holes:[]}],base_elevation_m:0,height_m:19.200000000000003},{id:"way/664093290",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[448.0954,-712.3524],[461.2186,-724.4553],[479.8518,-704.4671],[477.3177,-702.1196],[501.4922,-673.5049],[539.6654,-653.3166],[534.113,-643.3506],[494.9922,-660.0508],[467.2744,-692.8735],[451.2669,-678.1905],[432.6647,-698.2562],[435.621,-700.9802],[404.8428,-694.1376],[401.4436,-693.728],[398.1886,-694.1267],[395.7474,-695.8321],[374.8997,-719.6628],[385.7258,-729.7505],[403.9779,-709.4855],[405.3994,-709.0426],[402.6084,-727.3582],[428.9266,-733.7469],[433.0566,-715.1876],[446.8697,-717.9999]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/664093294",phase:"1",construction_status:"mapped_unverified_current",geometry:[{outer:[[79.4366,-434.9341],[102.6227,-434.5574],[103.4058,-472.6171],[115.344,-472.5173],[114.396,-428.478],[114.3136,-425.7871],[74.7911,-431.0584],[65.0676,-442.5638],[77.7371,-453.1611],[87.4709,-441.6446]],holes:[]}],base_elevation_m:0,height_m:22.799999999999997},{id:"relation/16121437",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-119.366,240.2847],[-123.6198,250.7049],[-125.7621,249.8855],[-160.8947,295.0436],[-167.5588,289.9941],[-167.188,289.4515],[-168.7021,288.1781],[-169.2686,288.8868],[-177.4672,298.9859],[-189.4049,292.2977],[-203.0008,288.2671],[-201.25,275.2335],[-201.1573,274.5359],[-203.1349,274.2037],[-203.1864,274.8238],[-211.622,273.8938],[-203.6403,217.0865],[-206.0299,216.4],[-201.426,205.9022],[-183.6173,213.3434],[-172.2976,218.0495],[-136.8244,232.788],[-131.6641,234.9252],[-130.0574,232.9984]],holes:[[[-176.1593,283.4276],[-150.7807,250.694],[-149.658,248.125],[-179.7133,235.7562],[-185.1414,233.5305],[-185.6976,233.2979],[-186.9233,235.6566],[-192.4539,276.5512],[-192.5775,277.4592],[-184.1006,280.2939],[-176.6228,284.0145]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121438",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-274.6275,225.5921],[-259.4661,213.6213],[-252.2869,222.7126],[-254.3778,224.1632],[-231.3669,276.5738],[-239.1124,279.8517],[-239.2978,279.3866],[-241.2239,280.2061],[-240.9355,280.8927],[-235.8471,293.0181],[-242.748,296.8275],[-251.2041,303.1063],[-257.4664,309.972],[-268.1681,302.0878],[-268.8067,301.6117],[-270.2898,303.2838],[-269.4143,303.9039],[-274.4303,310.4595],[-320.5745,276.2654],[-322.2945,277.716],[-329.2781,269.0345],[-321.1928,258.7249],[-318.8753,260.5299],[-314.5803,257.1302],[-284.2578,233.1998]],holes:[[[-248.99,284.1373],[-265.3881,246.5541],[-267.3554,244.273],[-267.8086,244.6163],[-272.4744,248.3038],[-297.853,268.3584],[-296.1638,270.6949],[-263.1212,295.2111],[-262.1942,295.7869],[-255.6436,289.9843],[-248.6089,285.0232]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121439",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-149.213,464.5347],[-164.2197,476.3171],[-171.3472,467.4473],[-169.38,465.9745],[-192.3492,413.597],[-184.5625,410.3856],[-184.3668,410.8507],[-182.4717,410.0977],[-182.7292,409.4665],[-187.9204,397.6732],[-175.5092,389.4676],[-166.2498,380.2322],[-155.61,388.1275],[-155.1671,388.4486],[-153.8899,386.8097],[-154.3534,386.4443],[-149.0284,379.5455],[-102.9673,413.6958],[-101.4429,412.4224],[-94.4081,421.1593],[-96.6844,423.4405],[-102.6891,431.4577],[-105.0375,429.83],[-109.2089,433.1077],[-139.5519,456.9382]],holes:[[[-174.8293,406.244],[-158.4933,443.7498],[-156.5055,445.7984],[-156.042,445.444],[-151.4895,441.9226],[-126.0079,422.2005],[-127.3469,419.8307],[-160.8113,395.0817],[-161.522,394.5613],[-167.846,400.3307],[-175.2722,405.2252]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16121440",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-146.7734,316.8472],[-149.987,309.1401],[-108.7464,291.8982],[-109.1481,289.8275],[-97.7049,288.0003],[-97.2826,290.9901],[-93.1626,300.314],[-95.7478,301.3328],[-94.965,306.9581],[-90.7007,338.6394],[-89.1041,350.7539],[-86.5908,369.8003],[-97.9928,371.3396],[-98.3636,368.5712],[-142.8178,363.3116],[-141.5716,354.9622],[-140.7476,355.084],[-140.2944,352.8361],[-141.3759,352.7143],[-154.6215,351.2638],[-154.5496,339.1383],[-158.4328,323.6575],[-146.0112,318.8626],[-145.2696,318.5525],[-146.0936,316.5703]],holes:[[[-141.8396,335.6611],[-141.2524,343.9219],[-140.4078,344.0326],[-111.0531,347.8417],[-108.8902,347.2658],[-109.6833,341.1865],[-113.0413,315.6177],[-115.8943,315.7064],[-142.6533,326.8908],[-143.5391,327.212]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16123936",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-302.3505,450.8279],[-304.668,449.8978],[-304.4105,449.2002],[-304.8946,448.8569],[-303.4218,447.1958],[-300.1054,439.3557],[-298.0042,440.2969],[-262.9239,395.2271],[-256.1671,400.1879],[-256.5585,400.9298],[-254.8281,402.1479],[-254.447,401.6496],[-246.4751,391.041],[-234.1564,398.1168],[-220.9622,401.7487],[-222.7336,414.6605],[-222.8366,415.4024],[-220.6839,415.6681],[-220.6428,415.1034],[-212.1557,416.3435],[-220.1063,472.9072],[-217.9331,473.9702],[-222.0528,484.4347],[-240.0673,476.8828],[-251.0984,472.2654],[-287.22,457.1285],[-292.1125,455.08],[-293.884,457.3279]],holes:[[[-247.7211,406.7322],[-272.9963,439.2223],[-274.1086,442.0904],[-243.724,454.5698],[-238.502,456.7179],[-237.9973,456.9283],[-236.9262,454.0492],[-231.1383,413.664],[-231.0765,413.1989],[-239.2958,410.1095],[-247.1752,406.0346]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/16123937",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-337.0327,323.1621],[-337.4139,320.5487],[-325.8574,318.8764],[-325.6411,321.3347],[-281.0837,326.6934],[-282.1135,335.209],[-283.1023,335.0761],[-283.3701,337.3351],[-282.3092,337.479],[-269.0532,338.9626],[-269.4445,346.0719],[-268.3216,356.492],[-265.5199,366.2256],[-277.7251,371.4636],[-278.5285,371.7958],[-277.6736,373.7004],[-276.8084,373.4125],[-273.7904,381.1861],[-315.216,398.4726],[-315.0821,400.787],[-325.9072,402.1049],[-328.5855,383.1582],[-330.275,371.1435],[-334.7767,339.3404],[-335.539,333.9255],[-338.1552,333.7594]],holes:[[[-311.9006,342.4295],[-314.7228,342.961],[-311.3439,368.4301],[-310.5198,374.6866],[-307.8109,374.4429],[-281.2375,363.5018],[-280.2797,363.1031],[-282.0514,354.6983],[-282.5253,346.205],[-283.5656,346.0721]]]}],base_elevation_m:0,height_m:33.1},{id:"relation/18706867",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-248.8986,198.6387],[-247.8069,195.0066],[-245.8191,191.5848],[-243.0793,188.7167],[-239.7319,186.5795],[-235.9621,185.2838],[-232.0069,184.9073],[-228.062,185.483],[-224.3746,186.9558],[-221.1301,189.2479],[-218.349,192.5257],[-216.495,196.3903],[-215.7018,200.5982],[-216.0005,204.8726],[-217.4012,208.9255],[-219.7907,212.4912],[-222.2936,214.6949],[-223.0146,215.3372],[-226.8564,217.264],[-231.0794,218.15],[-234.8904,218.0282],[-238.5778,217.0427],[-241.9356,215.2489],[-244.8093,212.7463],[-247.0342,209.6679],[-248.5071,206.1687],[-249.1355,202.4258]],holes:[[[-242.1317,192.3599],[-244.2225,195.1173],[-245.6026,198.5833],[-245.9734,202.2929],[-245.3141,205.9693],[-243.6558,209.3135],[-241.1529,212.0818],[-237.9701,214.0529],[-234.3651,215.0937],[-230.616,215.1047],[-227.3406,214.241],[-224.3948,212.591],[-221.9435,210.2655],[-220.141,207.3974],[-219.1214,204.1861],[-218.936,200.8197],[-219.5953,197.5198],[-221.0579,194.4746],[-223.2312,191.8945],[-226.0637,189.8903],[-229.3186,188.6612],[-232.7793,188.2958],[-236.2195,188.8274],[-239.4022,190.2116]]]}],base_elevation_m:0,height_m:.18},{id:"relation/19666480",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-278.0558,314.7893],[-272.6176,303.7268],[-267.2515,296.1967],[-260.9378,289.4085],[-253.8103,283.4841],[-245.9722,278.5341],[-237.5572,274.6139],[-228.7096,271.8233],[-221.407,270.2396],[-217.6166,270.0624],[-213.6306,269.8741],[-210.2831,269.719],[-201.0235,270.4498],[-191.9492,272.3654],[-183.1737,275.4326],[-174.8925,279.5962],[-167.2087,284.7896],[-154.6015,297.1696],[-149.1734,305.3308],[-145.1563,313.3369],[-142.1796,321.7749],[-140.2843,330.5229],[-139.5014,339.4371],[-139.8413,348.3734],[-141.3038,357.199],[-145.1661,368.5494],[-152.0772,381.6495],[-157.6184,388.6923],[-164.0146,394.9932],[-171.1317,400.4525],[-178.8874,404.9927],[-187.1581,408.5142],[-194.5946,410.3414],[-199.1883,411.3381],[-204.5442,412.368],[-213.3917,412.6782],[-222.2084,411.881],[-230.8706,410.0208],[-239.2341,407.1197],[-247.165,403.2108],[-254.55,398.3718],[-261.2965,392.658],[-267.2808,386.1801],[-268.0224,385.3053],[-272.4103,379.0045],[-276.6231,371.2642],[-279.8471,363.0588],[-282.0205,354.5322],[-283.1433,345.7953],[-283.1641,336.9918],[-282.1034,328.2548],[-279.9611,319.706]],holes:[[[-260.4328,302.9736],[-265.2325,309.7063],[-270.0939,319.5951],[-271.7933,323.9913],[-273.7089,331.6321],[-274.6564,339.45],[-274.6356,347.3122],[-273.6364,355.119],[-271.6896,362.7486],[-268.8158,370.0792],[-265.0459,377.0001],[-261.1319,382.6254],[-260.4624,383.4005],[-255.1167,389.203],[-249.0912,394.3078],[-242.4786,398.6374],[-235.3923,402.1254],[-227.9146,404.7165],[-220.1794,406.3775],[-212.2897,407.086],[-204.3897,406.8202],[-197.355,405.458],[-188.8474,403.365],[-181.4624,400.2201],[-174.5204,396.1671],[-168.1654,391.2836],[-162.4491,385.6471],[-157.4949,379.3573],[-151.3254,367.6415],[-147.8648,357.4981],[-146.5568,349.6137],[-146.2478,341.6297],[-146.9586,333.6568],[-148.6479,325.8389],[-151.3156,318.2979],[-154.9,311.1444],[-159.7514,303.847],[-171.0196,292.7847],[-177.8897,288.145],[-185.2953,284.4243],[-193.1233,281.6893],[-201.2499,279.973],[-209.5208,279.3087],[-219.4602,279.785],[-225.98,281.1914],[-233.9006,283.6942],[-241.4195,287.1935],[-248.4233,291.623],[-254.7989,296.9163]]]}],base_elevation_m:0,height_m:.18},{id:"relation/19971851",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-444.9095,110.1989],[-456.5904,87.5761],[-460.381,80.2455],[-458.9596,79.5478],[-462.8533,71.9183],[-464.3159,72.771],[-468.0859,65.4958],[-485.8958,31.1131],[-486.9772,31.6779],[-490.1499,25.5765],[-481.7245,21.1911],[-483.249,18.3342],[-479.5411,16.3298],[-476.6878,22.0879],[-467.4178,17.3814],[-470.2402,11.9554],[-470.642,10.981],[-470.4566,9.7961],[-465.3582,3.7277],[-463.5248,2.6092],[-462.0004,2.5095],[-460.2082,2.6977],[-458.6735,3.7053],[-457.3756,5.2113],[-453.0904,18.5105],[-452.9873,20.1493],[-453.7083,21.2235],[-455.1503,22.0873],[-454.522,23.3496],[-460.6916,26.5058],[-461.289,27.6574],[-461.2992,28.7426],[-457.8382,35.3534],[-455.7369,39.3952],[-445.6739,34.2014],[-441.6772,41.8974],[-425.8555,72.3159],[-418.9335,85.615],[-417.3988,84.7955],[-417.7696,84.0979],[-413.4746,81.9274],[-405.5329,96.8875],[-418.6549,103.4544],[-421.1786,98.5932],[-423.3827,99.7006],[-424.145,98.2057],[-432.869,102.7683],[-425.0714,117.518],[-430.2111,120.1979],[-433.394,114.1186],[-438.925,116.8207],[-440.7791,113.2329],[-443.6425,114.728],[-445.7541,110.6419]],holes:[[[-468.5507,21.6669],[-473.7522,24.369],[-436.2888,96.1132],[-431.0873,93.5218],[-454.3461,48.8076],[-455.9941,49.6271],[-462.741,36.8706],[-461.0209,35.9072]]]}],base_elevation_m:0,height_m:15.1},{id:"relation/19971852",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-361.8574,239.9119],[-364.0409,241.0525],[-363.7937,241.5176],[-373.0018,246.3348],[-373.3005,245.7701],[-377.8327,237.0775],[-378.9244,237.6423],[-383.0961,229.6362],[-382.0764,229.1047],[-399.6799,195.3752],[-401.6473,191.6102],[-392.8718,187.0366],[-393.4899,185.8518],[-390.7192,184.4011],[-393.2016,179.6506],[-401.7917,184.1356],[-402.2655,183.2276],[-403.9753,184.1246],[-406.4577,179.3741],[-403.9342,178.0674],[-404.5832,176.8272],[-405.9427,177.5359],[-425.1017,140.8388],[-426.1523,141.3814],[-428.5832,136.7417],[-427.4296,136.1437],[-431.076,129.1564],[-429.7371,128.4587],[-432.4358,123.2764],[-433.2701,123.7083],[-434.0529,122.2023],[-430.2111,120.1979],[-425.0714,117.518],[-424.8963,117.4183],[-424.4431,118.282],[-417.1714,114.4836],[-414.0709,120.43],[-412.8041,119.7766],[-388.464,166.4066],[-377.9787,160.936],[-393.7179,130.7832],[-378.0929,122.6327],[-370.0895,137.9804],[-362.4676,134.0048],[-346.8212,163.9805],[-359.9226,170.8242],[-352.2591,185.5186],[-349.0455,183.8353],[-311.7497,164.3673],[-300.0691,186.7356],[-298.4417,185.8829],[-292.6738,182.8708],[-288.4918,190.8769],[-294.3216,193.8779],[-333.5743,214.0657],[-334.9545,214.7744],[-329.3305,225.6485],[-347.5303,235.15],[-353.0819,238.0514],[-360.7449,242.0491]],holes:[[[-376.7935,189.0516],[-369.336,203.3363],[-355.6578,196.4039],[-370.9746,167.1259],[-386.0844,174.911],[-383.19,180.4477],[-380.2752,178.9637],[-375.3721,188.3097]]]}],base_elevation_m:0,height_m:48.7},{id:"way/1191618600",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-121.7638,501.7969],[-116.377,506.182],[-109.0126,515.2179],[-104.4188,524.0988],[-101.9469,530.754],[-100.1856,538.0071],[-100.6078,547.32],[-103.4196,555.6473],[-108.3737,560.7854],[-114.296,565.3145],[-121.3101,567.3743],[-127.356,568.1273],[-134.9057,567.8173],[-140.7972,566.4],[-149.7476,564.5729],[-158.3685,561.1956],[-164.3733,557.9511],[-171.8304,554.8727],[-176.4447,549.4135],[-179.2257,543.4892],[-179.8335,535.7378],[-176.136,525.4283],[-173.0255,520.0908],[-169.3795,513.8342],[-165.4759,510.036],[-158.4412,503.1925],[-148.9758,498.165],[-138.2023,496.3821],[-131.3014,496.5149]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/1191618603",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-188.663,317.8775],[-185.2228,319.6381],[-182.4212,322.2847],[-180.4539,325.5846],[-179.4754,329.3052],[-179.5783,333.1478],[-180.7422,336.8131],[-182.8639,340.0134],[-185.8096,342.516],[-189.3219,344.1107],[-192.5457,344.6644],[-195.8108,344.4429],[-198.942,343.4685],[-201.7538,341.8075],[-204.0919,339.5153],[-205.9563,336.4812],[-206.9657,333.0595],[-207.079,329.516],[-206.2654,326.05],[-204.5865,322.9051],[-202.1558,320.3028],[-199.138,318.387],[-195.7287,317.3017],[-192.1547,317.1356]],holes:[]}],base_elevation_m:0,height_m:8.75},{id:"way/1209647875",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-96.9623,444.6795],[-93.2853,444.4137],[-91.4725,448.7213],[-100.1856,538.0071],[-100.6078,547.32],[-103.4196,555.6473],[-108.3737,560.7854],[-114.296,565.3145],[-121.3101,567.3743],[-127.356,568.1273],[-134.9057,567.8173],[-140.7972,566.4],[-149.7476,564.5729],[-158.3685,561.1956],[-164.3733,557.9511],[-171.8304,554.8727],[-176.4447,549.4135],[-179.2257,543.4892],[-179.8335,535.7378],[-176.136,525.4283],[-173.0255,520.0908],[-169.3795,513.8342],[-165.4759,510.036],[-171.4911,500.1031],[-141.4674,487.778],[-118.1282,470.9903]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1384048510",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-243.2872,725.7713],[-234.193,704.0339],[-181.3247,725.9034],[-189.9452,747.7626],[-203.6644,742.071],[-212.3676,738.6162]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048511",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-257.201,786.8531],[-253.8746,763.654],[-220.6274,768.5148],[-211.4608,769.8324],[-196.7941,771.8255],[-200.1206,795.0245],[-214.6739,792.9429],[-224.026,791.6032]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048512",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-255.5417,849.5846],[-258.0861,826.2749],[-224.7362,822.8526],[-215.5078,821.7784],[-200.7589,820.2943],[-198.4721,843.6484],[-213.0356,845.1213],[-222.5214,846.1292]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048513",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-238.7937,909.9129],[-246.8277,887.6552],[-215.4143,876.3266],[-206.2169,873.0154],[-193.0748,868.2758],[-185.0512,890.5335],[-198.183,895.2621],[-207.1847,898.5178]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384048514",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-207.4413,964.3056],[-220.6558,944.9271],[-192.796,926.1128],[-185.298,920.9414],[-173.1447,912.7358],[-160.1054,932.4576]],holes:[]}],base_elevation_m:0,height_m:28.65},{id:"way/1384101157",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-224.7362,822.8526],[-224.9012,806.7739],[-224.026,791.6032],[-214.6739,792.9429],[-214.9932,796.1653],[-213.1701,796.4311],[-213.8704,807.5932],[-213.6127,818.7885],[-215.6211,818.7775],[-215.5078,821.7784]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101158",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-206.2169,873.0154],[-215.4143,876.3266],[-219.8022,860.3807],[-222.5214,846.1292],[-213.0356,845.1213],[-212.4691,848.4212],[-210.6048,848.1665],[-209.2246,855.4861],[-205.599,869.8706],[-207.2057,870.2028]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101159",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-185.298,920.9414],[-192.796,926.1128],[-198.9655,916.18],[-207.1847,898.5178],[-198.183,895.2621],[-197.0706,898.0415],[-195.2785,897.2995],[-190.0977,908.2291],[-185.0818,917.4089],[-186.9048,918.2948]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101160",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-220.6274,768.5148],[-216.652,750.2324],[-212.3676,738.6162],[-203.6644,742.071],[-204.7149,745.0719],[-203.0051,745.5259],[-209.0404,767.1858],[-210.7501,766.8093],[-211.4608,769.8324]],holes:[]}],base_elevation_m:0,height_m:19},{id:"way/1384101161",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-154.1216,909.8565],[-167.6138,918.4718],[-157.9219,933.122],[-206.8645,965.8448],[-209.7278,967.7495],[-225.0331,945.4587],[-221.8094,943.0779],[-222.7776,941.8044],[-196.4523,923.8317],[-202.6013,912.4593],[-207.9572,901.0758],[-241.6466,912.936],[-251.1123,887.5224],[-247.5281,886.3486],[-248.2285,884.5104],[-217.6803,873.4696],[-221.0896,861.0009],[-223.3969,848.4435],[-259.2907,851.8215],[-262.1132,824.7136],[-258.6732,824.3481],[-258.9719,822.5985],[-226.3327,819.3091],[-226.5182,805.5005],[-225.6533,793.6186],[-261.3208,788.2928],[-257.3559,761.5058],[-253.4729,762.0373],[-253.2464,760.033],[-221.6471,764.7166],[-218.0631,750.8304],[-214.4172,739.7679],[-247.7572,726.3029],[-236.7679,699.1726],[-193.6123,716.7789],[-194.2096,718.2739],[-179.6047,724.6631],[-185.5474,739.8671],[-173.6925,744.4625],[-174.1148,745.8024],[-171.097,746.8544],[-174.9489,757.3964],[-177.771,756.5881],[-178.6258,759.5004],[-179.7381,763.2211],[-182.9618,774.0732],[-186.1338,794.4043],[-187.5137,810.7377],[-186.2672,835.188],[-184.6192,845.0767],[-178.9542,864.1674],[-169.5608,889.0273],[-166.2237,895.5164],[-164.5448,898.8938],[-162.6806,901.9611],[-160.0954,900.4551]],holes:[]}],base_elevation_m:0,height_m:3.8},{id:"way/1388933765",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-156.5422,884.2766],[-151.9178,877.3999],[-147.9938,870.1357],[-144.1007,859.9923],[-141.5465,850.159],[-140.0635,834.2574],[-141.4746,819.441],[-145.0075,805.9867],[-150.6724,794.0606],[-157.6968,782.9539],[-166.5236,773.4972],[-163.887,770.6513],[-141.7225,747.6846],[-141.1766,748.3711],[-130.3928,759.7989],[-123.4714,769.9311],[-116.4161,782.2891],[-111.0808,795.0458],[-106.7652,810.7702],[-109.68,811.3682],[-108.1041,821.4561],[-107.2491,834.1575],[-104.3756,834.1464],[-105.4672,851.3989],[-108.0626,863.912],[-111.8733,876.3698],[-119.4433,892.9137],[-127.1473,904.9396],[-127.7034,905.8144],[-153.8334,887.0671]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554451",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-217.6166,270.0624],[-222.2936,214.6949],[-219.7907,212.4912],[-218.8122,215.6582],[-213.6306,269.8741]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554454",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-181.3065,521.5083],[-188.6195,504.6213],[-189.454,491.1559],[-187.1058,479.0747],[-184.6236,474.5456],[-184.2013,470.5591],[-185.4477,459.1534],[-199.1883,411.3381],[-194.5946,410.3414],[-179.7828,462.3203],[-179.7827,470.559],[-181.307,478.6649],[-183.5111,484.2903],[-184.2011,491.7095],[-183.789,500.7677],[-181.9967,507.0906],[-175.7756,514.9195]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554455",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-107.9526,384.0853],[-107.7467,381.638],[-90,383.1882],[-90.2163,385.6355]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554456",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-97.7557,395.7124],[-99.2492,397.7278],[-111.1044,389.0462],[-109.6212,387.0308]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1434554457",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-361.413,304.8359],[-375.5453,268.4598],[-361.8877,263.2217],[-352.7203,286.8081],[-356.2222,288.148],[-351.2574,300.9378],[-354.543,302.2003]],holes:[]}],base_elevation_m:0,height_m:.18},{id:"way/1446422779",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-127.1473,904.9396],[-148.4468,889.7247],[-143.5031,882.3165],[-136.757,868.4745],[-133.9247,859.4939],[-131.2573,847.0804],[-130.6806,834.1576],[-128.7752,834.1244],[-107.2491,834.1575],[-104.3756,834.1464],[-105.4672,851.3989],[-108.0626,863.912],[-111.8733,876.3698],[-119.4433,892.9137]],holes:[]}],base_elevation_m:0,height_m:31.45},{id:"way/1446422780",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-132.339,816.5175],[-134.2342,808.7771],[-136.531,801.369],[-142.4431,788.867],[-148.1388,780.2187],[-153.2475,773.5857],[-159.3861,767.0081],[-141.1766,748.3711],[-130.3928,759.7989],[-123.4714,769.9311],[-116.4161,782.2891],[-111.0808,795.0458],[-106.7652,810.7702],[-109.68,811.3682],[-130.9279,816.1964]],holes:[]}],base_elevation_m:0,height_m:31.45},{id:"way/1459082762",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-128.7752,834.1244],[-129.5683,823.9146],[-130.9279,816.1964],[-109.68,811.3682],[-108.1041,821.4561],[-107.2491,834.1575]],holes:[]}],base_elevation_m:0,height_m:11.399999999999999},{id:"way/1459105110",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-35.0389,915.47],[-27.9631,896.6782],[-13.8837,904.6401],[-2.3277,910.653],[9.7433,915.3925],[21.7525,919.3125],[30.1775,921.4276],[50.0967,925.7463],[43.3196,944.4605],[36.3159,940.928],[25.5118,934.6272],[16.9426,930.3417],[2.9251,924.6278],[-9.8257,920.9292],[-23.2562,918.4155],[-30.8573,916.5995]],holes:[]}],base_elevation_m:0,height_m:9.9},{id:"way/1459105119",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-87.5343,1105.0379],[-77.6367,1078.1624],[-76.8643,1078.4503],[-76.0918,1076.3685],[-78.2753,1075.5712],[-75.0825,1066.8895],[-73.5685,1067.4432],[-70.1801,1058.2522],[-52.9492,1064.5972],[-52.1664,1063.811],[-51.188,1063.1023],[-49.9623,1062.5486],[-48.2732,1062.3604],[-47.3772,1062.3271],[-45.8117,1062.6372],[-44.5449,1063.6117],[-43.4325,1064.9183],[-42.9176,1066.1475],[-42.5468,1067.8639],[-42.6292,1068.4065],[-23.153,1075.5821],[-33.0095,1102.3358],[-34.6162,1101.7378],[-37.8707,1110.5966],[-36.4185,1111.1392],[-40.5382,1122.3456]],holes:[]}],base_elevation_m:0,height_m:61.1},{id:"way/1459105120",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-97.504,1120.6073],[-123.0056,1066.2587],[-124.0459,1063.5014],[-123.7369,1061.7074],[-122.5422,1060.888],[-100.2646,1050.7334],[-98.4726,1049.4046],[-97.3499,1047.7657],[-94.2602,1040.1582],[-70.2213,1049.039],[-17.993,1067.3545],[-24.0078,1082.9349],[-27.4787,1094.3407],[-37.881,1123.6412],[-39.2199,1124.8261],[-41.1665,1125.3466],[-42.9586,1124.815],[-73.5271,1113.5202],[-76.3594,1113.3651],[-78.821,1114.0296],[-94.9703,1121.2939],[-96.0929,1121.3603]],holes:[]}],base_elevation_m:0,height_m:5.5},{id:"way/1459105121",phase:"2",construction_status:"construction_unverified",geometry:[{outer:[[-89.9546,1115.9343],[-91.139,1114.4394],[-108.1126,1077.9522],[-108.1126,1076.9888],[-107.886,1076.0143],[-106.7634,1075.1284],[-76.7099,1061.1092],[-74.7633,1060.0018],[-73.6407,1058.2854],[-70.2213,1049.039],[-69.2017,1046.2817],[-59.5717,1049.8473],[-16.788,1065.7156],[-17.993,1067.3545],[-24.0078,1082.9349],[-27.4787,1094.3407],[-31.0938,1102.9891],[-39.5186,1123.1097],[-72.1779,1112.1803],[-76.8744,1112.2467],[-81.3649,1113.8745],[-86.8236,1116.4658],[-88.9143,1116.6873]],holes:[]}],base_elevation_m:0,height_m:10.7},{id:"way/1459105140",phase:"2",construction_status:"mapped_unverified_current",geometry:[{outer:[[-153.6586,860.1806],[-152.227,856.1609],[-148.6016,857.4454],[-150.0332,861.4762]],holes:[]}],base_elevation_m:0,height_m:40.2}]};function pg({THREE:i,scene:e,camera:t,controls:n,invalidate:s,padding:r}){let a=null,o=()=>{a&&(e.remove(a),a.traverse(l=>{l.geometry?.dispose(),l.material?.dispose()}),a=null,t.clearViewOffset(),s())};return{clear:o,show(l){if(o(),!Array.isArray(l)||l.length<2||l.length>1e4||!l.every(b=>Array.isArray(b)&&b.length===2&&b.every(x=>Number.isFinite(x)&&Math.abs(x)<5e3)))return;a=new i.Group,a.name="companion-walking-route";let c=l.map(([b,x])=>new i.Vector3(b,1.8,-x)),u=new i.CurvePath;for(let b=1;b<c.length;b++)u.add(new i.LineCurve3(c[b-1],c[b]));let h=new i.Mesh(new i.TubeGeometry(u,Math.max(l.length*3,30),1.6,5,!1),new i.MeshBasicMaterial({color:1476972,depthTest:!1,transparent:!0,opacity:.95}));h.renderOrder=2e3,a.add(h);for(let[b,x]of[[0,1476972],[c.length-1,14056002]]){let y=new i.Mesh(new i.SphereGeometry(5,12,8),new i.MeshBasicMaterial({color:x,depthTest:!1}));y.position.copy(c[b]),y.renderOrder=2001,a.add(y)}e.add(a);let d=new i.Box3().setFromPoints(c),f=d.getCenter(new i.Vector3),m=d.getSize(new i.Vector3),_=r(),g=Math.max(innerWidth/Math.max(180,innerWidth-_.left-_.right),innerHeight/Math.max(180,innerHeight-_.top-_.bottom)),p=Math.max(180,m.length()*1.2)*Math.max(1,Math.min(4,g));n.target.copy(f),t.position.copy(f).add(new i.Vector3(p*.3,p,p*.6)),n.update(),s()}}}var Q=i=>document.querySelector(i),at=Q("#stage"),jd=Q("#status");Q("#runtime-version").textContent=zc;var Jr=[];window.addEventListener("error",i=>Jr.push(i.message));window.addEventListener("unhandledrejection",i=>Jr.push(String(i.reason)));var Mg=performance.now();at.dataset.codeReadyMs=String(Math.round(Mg));var fs=dg({width:innerWidth,height:innerHeight,coarse:matchMedia("(pointer:coarse)").matches,memory:navigator.deviceMemory,saveData:navigator.connection?.saveData}),Bt,je,Yn,Ke,Ze,zd,Tn=null,_s=-1,hn=null,en="all",Mi=!1,mg=0,Ao=0,Zs=[],Qc=null,gg=0,tn=!1,pt,Eo=0,Zr=[0,0,0],oi=!1,_g=!1,Kc=!1,tu=-1/0,wo=!1,So=[];async function Kr(){oi&&await new Promise(i=>{let e=()=>{Wi||su||Zt.active||performance.now()-tu<180?setTimeout(e,60):i()};e()})}var Ab=()=>new Promise(i=>requestAnimationFrame(()=>requestAnimationFrame(i))),Bd=[],kd=0,ps,Zt,Si,Wi=!1,su=!1,wt,Hd,Sg,Bn,Xn,ji=null,ri,nu,Ro,wg=2e3,ms={resize:0,resizeApplied:0,controlChange:0,controlsMoving:0,lodActivated:0},Nd=new Map,Jc=new Map,yg=new Bs,xg=new ce,qd=new WeakMap,$n,Vd=new WeakMap,Qr=ng(),iu={mapped:new Wt({color:7576958,roughness:.8}),estimated:new Wt({color:13017956,roughness:.8}),unknown:new Wt({color:5150376,roughness:.8})};iu.surveyed=new Wt({color:3435864,roughness:.8});iu.mixed=new Wt({color:9666741,roughness:.8});var Gd=ls,bt=i=>String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);async function Rb(i){if(Nd.has(i))return Nd.get(i);if(Jc.has(i))return Jc.get(i);let e=(async()=>{let t=await fetch(hs(`/campus-map/exports/campus-lod${i}.glb`));if(!t.ok)throw Error("Model load failed");let n=await t.arrayBuffer();await Kr();let s=await new Fc().parseAsync(n,"/campus-map/exports/");await Kr();let r=cg(s.scene,i),a=Cm(s.scene);return a.userData.photoArchitecture=r,a.traverse(o=>{if(o.isMesh){let l=Gd(o);o.castShadow=["building","building_batch","building_detail","d6_screen","building_runtime_batch"].includes(l.kind),o.receiveShadow=!0,qd.set(o,o.material),Vd.set(o,Qr.material(o.material)),o.material=Vd.get(o),Qr.prepareMesh(o)}}),Nd.set(i,a),a})().finally(()=>Jc.delete(i));return Jc.set(i,e),e}async function Ei(i,e=!1){let t=++mg;if(_s===i)return;let n=await Rb(i);t===mg&&(e&&(Wi||su||Zt.active)||(Tn&&Yn.remove(Tn),Tn=n,_s=i,Yn.add(Tn),ms.lodActivated++,wi()))}function wi(){if(!Tn)return;Hd&&(Hd.visible=(Bn?.layers||Yr).ground),nu?.update(Q("#show-surroundings").checked,Bn?.layers||Yr),$n&&($n.visible=(Bn?.layers||Yr).buildings);let i=Q("#evidence-colors").checked;Q(".legend").style.display=i?"flex":"none",Tn.traverse(e=>{let t=e.userData;e.visible=(!t.phase||en==="all"||t.phase===en)&&(t.construction_status!=="construction_unverified"||Q("#construction").checked);let n=Bn?.layers||Yr,s=Gd(e).kind,r=qd.get(e)?.name||"";if(e.isMesh){let a=s?.startsWith("building")||s==="d6_screen"?"buildings":/asphalt|paving|parking/i.test(r)?"roads":/water surface/i.test(r)?"water":/vegetat|sport|track/i.test(r)?"green":s==="surface"?"ground":null;a&&!n[a]&&(e.visible=!1)}if(e.isMesh){let a=Gd(e);e.material=i&&["building","building_detail","d6_screen","building_runtime_batch"].includes(a.kind)?iu[a.height_status]||iu.unknown:Vd.get(e)}}),jd.textContent=`${en==="all"?"\u5168\u6821":en==="1"?"\u4E00\u671F":"\u4E8C\u671F"}\u7A7A\u95F4\u57FA\u7EBF \xB7 LOD ${_s}`,wt?.attachWater(Tn),ps?.refresh(),je.shadowMap.needsUpdate=!0,wt?.invalidateEnvironment(),pt?.invalidate()}function ru(){let i=Q("#lod").value;if(i!=="auto")return Q("#evidence-colors").checked?Math.min(1,Number(i)):Number(i);let e=Ke.position.distanceTo(Ze.target),t=e<(_s===0?430:340)?0:e<(_s===2?1400:1700)||Q("#evidence-colors").checked?1:2;return fs.lightweight&&wt?.quality==="balanced"?Math.max(1,t):t}function bi(i="all",e=Mi){en=i,Mi=e;let n=Bt.buildings.filter(g=>(i==="all"||g.phase===i)&&(Q("#construction").checked||g.construction_status!=="construction_unverified")).flatMap(g=>g.geometry.flatMap(p=>p.outer.map(([b,x])=>[b,x,g.base_elevation_m+(g.display_height_m??g.height_m)]))),s=n.length?[Math.min(...n.map(g=>g[0])),Math.min(...n.map(g=>g[1])),Math.max(...n.map(g=>g[0])),Math.max(...n.map(g=>g[1]))]:Bt.bounds,r=(s[0]+s[2])/2,a=(s[1]+s[3])/2,o=new C(r,0,-a),l=new C(...e?[0,1,1e-5]:[.55,.82,.8]).normalize(),c=new C().crossVectors(new C(0,1,0),l).normalize(),u=new C().crossVectors(l,c).normalize(),h=Math.tan(ft.degToRad(Ke.fov/2)),d=100,f=au(),m=Math.max(.35,(at.clientWidth-f.left-f.right)/at.clientWidth),_=Math.max(.4,(at.clientHeight-f.top-f.bottom)/at.clientHeight);for(let[g,p,b]of n)for(let x of[0,b]){let y=new C(g-r,x,-p+a),E=y.dot(l);d=Math.max(d,Math.abs(y.dot(c))/(h*Ke.aspect*m*.86)+E,Math.abs(y.dot(u))/(h*_*.86)+E)}Ro=s,wg=d,Co(),Zt.move(o.clone().addScaledVector(l,d),o,!!Ao),document.querySelectorAll("[data-view]").forEach(g=>{g.classList.toggle("active",g.dataset.view===en),g.setAttribute("aria-pressed",String(g.dataset.view===en))}),nn(Q("#top"),"top",e?"\u900F\u89C6":"\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed",String(e)),wi(),oi&&Ei(ru()),hn&&i!=="all"&&hn.phase!==i&&(hn=null,gs(),Ks()),ji&&i!=="all"&&ji.phase!==i&&Ks()}function Co(){Ro&&Si.setRegion(Q("#show-surroundings").checked&&ri?ri.bounds:Ro,Q("#show-surroundings").checked?4200:wg)}function Cb(){if(!ri)return;bi("all",!1),Q("#show-surroundings").checked=!0,Co(),wi(),hn=null,gs(),Ks();let i=ri.bounds,e=new C((i[0]+i[2])/2,0,-(i[1]+i[3])/2),t=new C(.18,1,.65).normalize();Zt.move(e.clone().addScaledVector(t,5700),e),Mi=!1,nn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false")}function gs(){$n&&(Yn.remove($n),$n.geometry.dispose(),$n.material.dispose(),$n=null,pt?.invalidate())}function Ks(){ji=null,Bn?.clearSelection(),Q(".explore").classList.remove("has-selection"),Q(".detail").hidden=!0,ai(),Q("#detail-title").textContent="\u4E24\u671F\u6821\u56ED\uFF0C\u540C\u4E00\u5750\u6807\u7CFB",Q("#detail-body").innerHTML=`<p>\u5EFA\u7B51\u5185\u9662\u3001\u9053\u8DEF\u8D70\u5411\u4E0E\u6821\u533A\u5173\u7CFB\u6765\u81EA\u516C\u5F00\u5730\u56FE\u5FEB\u7167\u3002\u4FDD\u7559\u6BCF\u680B\u5EFA\u7B51\u7684\u6765\u6E90\u8BB0\u5F55\uFF0C\u65B9\u4FBF\u6301\u7EED\u6821\u51C6\u3002</p><div class="big-stat">${Bt.stats.buildings}<small>\u5DF2\u6536\u5F55\u5EFA\u7B51\u4E0E\u6784\u7B51\u7269</small></div>`,Q("#building").value=""}function ea(i,e=!0){if(!i||tn)return;hn=i,Q("#building").value=i.id,gs(),ji=null,cu(),Q(".explore").classList.add("has-selection"),Q(".detail").hidden=!1,ai(),i.construction_status==="construction_unverified"&&!Q("#construction").checked&&(Q("#construction").checked=!0,wi());let t=[];for(let r of i.parts.length?i.parts:[i]){let a=i.base_elevation_m+(i.uncertainty_display?i.display_height_m+.4:r.height_m+.7);for(let o of r.geometry)for(let l of[o.outer,...o.holes])for(let c=0;c<l.length;c++){let u=l[c],h=l[(c+1)%l.length];t.push(u[0],a,-u[1],h[0],a,-h[1])}}let n=new gt;n.setAttribute("position",new rt(t,3)),$n=new Ni(n,new fi({color:15969591,depthTest:!1})),$n.renderOrder=5,$n.visible=Bn?.layers.buildings??!0,Yn.add($n),Q("#detail-title").textContent=i.display_name||i.name;let s={mapped:"\u5730\u56FE\u5DF2\u6709\u9AD8\u5EA6\u8BB0\u5F55",estimated:"\u6309\u697C\u5C42\u4F30\u7B97",mixed:"\u5206\u4F53\u542B\u5730\u56FE\u9AD8\u5EA6\u4E0E\u4F30\u7B97",unknown:"\u672A\u77E5 \xB7 \u4EC5\u663E\u793A\u8F6E\u5ED3",surveyed:"\u6709\u5B9E\u6D4B\u8BB0\u5F55"};if(Q("#detail-body").innerHTML=`<span class="badge">${i.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${s[i.height_status]}</span><dl><dt>${i.uncertainty_display?"\u539F\u59CB\u4F30\u9AD8\uFF08\u672A\u663E\u793A\u4E3A\u5B9E\u4F53\uFF09":i.parts.length?"\u6700\u5927\u9876\u9AD8":"\u5EFA\u7B51\u9AD8\u5EA6"}</dt><dd>${i.height_status==="unknown"?"\u5F85\u6838\u5B9E":i.height_m.toFixed(2)+" m"}</dd><dt>${i.parts.length?"\u6700\u591A\u5C42\u6570":"\u5730\u56FE\u697C\u5C42"}</dt><dd>${i.levels??"\u672A\u6807\u6CE8"}</dd><dt>\u8F6E\u5ED3\u9762\u79EF</dt><dd>\u7EA6 ${Math.round(i.area_m2).toLocaleString()} m\xB2</dd><dt>\u5730\u9762\u9AD8\u7A0B</dt><dd>\u672A\u77E5\uFF0C\u6682\u7F6E\u7EDF\u4E00\u57FA\u51C6</dd><dt>\u7ACB\u9762\u6750\u8D28</dt><dd>${i.detail_profile?bt(i.detail_profile.facade_summary_zh||"\u4E3B\u7ACB\u9762\u6309\u822A\u62CD\u4F30\u7B97\uFF0C\u80CC\u9762\u53CA\u7AEF\u9762\u5F85\u6838\u5B9E"):"\u5C55\u793A\u7528\u8FD1\u4F3C\u8272\uFF0C\u5F85\u5B9E\u62CD\u6821\u51C6"}</dd><dt>\u5EFA\u8BBE\u72B6\u6001</dt><dd>${i.construction_status==="construction_unverified"?"\u5730\u56FE\u6807\u4E3A\u65BD\u5DE5\uFF0C\u5F53\u524D\u72B6\u6001\u5F85\u6838\u5B9E":"\u5730\u56FE\u6536\u5F55\uFF0C\u73B0\u72B6\u5F85\u6838\u5B9E"}</dd></dl><a class="source-link" href="${bt(i.source_url)}" target="_blank" rel="noreferrer">\u67E5\u770B\u539F\u59CB\u5730\u56FE\u8BB0\u5F55 \u2197</a><p>\u8BB0\u5F55\u66F4\u65B0\uFF1A${bt(i.source_timestamp?.slice(0,10))}\u3002${i.height_status==="estimated"?"\u9AD8\u5EA6\u6309\u516C\u5F00\u697C\u5C42\u4E0E\u4F30\u8BA1\u5C42\u9AD8\u6362\u7B97\uFF0C\u5C1A\u672A\u5B9E\u6D4B\u3002":"\u5730\u56FE\u8BB0\u5F55\u4E0D\u7B49\u540C\u4E8E\u5B9E\u5730\u6D4B\u91CF\u3002"}</p>`,Bn?.addActions(i,r=>ps.showInside(r)),i.publicPlace){let r=document.createElement("details");r.className="part-records";let a=document.createElement("summary");a.textContent="\u6821\u56ED\u5730\u70B9\u8D44\u6599",r.append(a),du(r,i.publicPlace),Q("#detail-body").append(r)}if(i.uncertainty_display&&Q("#detail-body").insertAdjacentHTML("afterbegin",`<p><strong>\u5F85\u6838\u8F6E\u5ED3 \xB7 \u5DF2\u91C7\u7528 B \u65B9\u6848</strong></p><p>${bt(i.uncertainty_display.summary_zh)}</p><p>${bt(i.uncertainty_display.remaining_zh)}</p>`),i.courtyard_photo&&Q("#detail-body").insertAdjacentHTML("afterbegin",`<p><strong>\u5185\u9662\u5DF2\u6309\u7167\u7247\u6BD4\u4F8B\u6316\u7A7A \xB7 \u5C3A\u5BF8\u53CA\u9662\u5E95\u4F30\u7B97</strong></p><p>${bt(i.courtyard_photo.summary_zh)}</p><p>${bt(i.courtyard_photo.remaining_zh)}</p>`),i.d6_screen_photo&&Q("#detail-body").insertAdjacentHTML("afterbegin","<p><strong>D6\u524D\u90E8\u5DF2\u91C7\u7528\u7167\u7247\u6BD4\u4F8B \xB7 \u5C3A\u5BF8\u4F30\u7B97</strong></p><p>\u524D\u90E8\u4E2D\u6BB5\u6682\u630913.2\u7C73\u3001\u4E24\u4FA79.9\u7C73\u53CA\u5F27\u5F62\u683C\u6805\u8868\u8FBE\uFF1B\u66F2\u7387\u3001\u5206\u683C\u3001\u539A\u5EA6\u548C\u8272\u5F69\u5747\u672A\u5B9E\u6D4B\u3002\u539F\u5730\u56FE\u7EDF\u4E0014.62\u7C73\u5206\u4F53\u8BB0\u5F55\u4FDD\u7559\uFF0C\u4E0D\u80FD\u636E\u672C\u6A21\u578B\u8BA4\u5B9A\u5730\u56FE\u9AD8\u5EA6\u9519\u8BEF\u3002</p><p>\u4E0B\u90E8\u7FFC\u697C\u3001\u95E8\u5385\u8FDB\u6DF1\u3001\u652F\u6491\u548C\u5730\u5F62\u4ECD\u5F85\u6838\u5B9E\uFF1B\u683C\u6805\u540E\u4E3A\u4E0D\u900F\u660E\u80CC\u666F\uFF0C\u4E0D\u8868\u793A\u5165\u53E3\u53EF\u901A\u884C\u3002\u8F7B\u91CF\u6863\u7701\u7565\u7EC6\u683C\u6805\u3002</p>"),i.parts.length){let r=i.parts.map(a=>`<li><a href="${bt(a.source_url)}" target="_blank" rel="noreferrer">${bt(a.id)} \u2197</a><br>${a.min_height_m.toFixed(1)}\u2013${a.height_m.toFixed(1)} m \xB7 ${s[a.height_status]}</li>`).join("");Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>${i.parts.length} \u4E2A\u516C\u5F00\u5EFA\u7B51\u5206\u4F53</strong>\uFF0C\u9AD8\u5EA6\u4E0E\u697C\u5C42\u663E\u793A\u5176\u4E2D\u6700\u5927\u503C\u3002\u5404\u5206\u4F53\u5206\u522B\u4FDD\u7559\u9AD8\u5DEE\u4E0E\u67B6\u7A7A\u90E8\u5206\u3002${i.part_gap_area_m2>.1?`\u5206\u4F53\u672A\u8986\u76D6\u8F6E\u5ED3\u7684\u7EA6 ${i.part_gap_area_m2.toFixed(1)} m\xB2 \u533A\u57DF\u6682\u7559\u7A7A\u3002`:""}</p><details class="part-records"><summary>\u5206\u4F53\u9AD8\u5EA6\u4E0E\u6765\u6E90</summary><p>\u533A\u95F4\u4E3A\u57FA\u51C6\u5730\u9762\u4EE5\u4E0A\u5E95\u90E8\u81F3\u9876\u90E8\uFF1B\u697C\u5C42\u6362\u7B97\u7684\u5E95\u9AD8\u4E0E\u9876\u9AD8\u5747\u4E3A\u4F30\u7B97\u3002</p><ul>${r}</ul></details>`)}if(i.official_map_label){let r=i.official_map_label;Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5B66\u6821\u5730\u56FE\u6807\u8BC6</strong>\uFF1A${bt(r.label_zh)} \xB7 <a href="${bt(r.source_url)}" target="_blank" rel="noreferrer">\u67E5\u770B\u624B\u7ED8\u5730\u56FE \u2197</a>\u3002\u6B64\u9879\u6838\u5BF9\u5EFA\u7B51\u6807\u8BC6\uFF0C\u4E0D\u8868\u793A\u5C3A\u5BF8\u5DF2\u5B9E\u6D4B\u3002</p>`)}if(i.material_reference){let r=i.material_reference;Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5899\u9762\u4E3B\u6750\u4F9D\u636E</strong>\uFF1A${bt(r.summary_zh)} <a href="${bt(r.source.url)}" target="_blank" rel="noreferrer">\u8BBE\u8BA1\u65B9\u9879\u76EE\u8BF4\u660E \u2197</a></p>`),Q("#detail-body").insertAdjacentHTML("beforeend","<p>\u5899\u9762\u9897\u7C92\u4E3A\u663E\u793A\u4F30\u7B97\uFF0C\u9897\u7C92\u5927\u5C0F\u3001\u8D77\u4F0F\u53CA\u5B9E\u9645\u53CD\u5C04\u5C1A\u672A\u6D4B\u91CF\uFF1B\u8F7B\u91CF\u89C6\u56FE\u7701\u7565\u5FAE\u8868\u9762\u3002</p>")}if(i.geometry_observations?.length){let r=i.geometry_observations.map(a=>`<p>${bt(a.summary_zh)}</p><p>${a.sources.map((o,l)=>`<a href="${bt(o.url)}" target="_blank" rel="noreferrer">\u5B9E\u666F\u53C2\u8003 ${l+1} \u2197</a>`).join(" \xB7 ")}</p>`).join("");Q("#detail-body").insertAdjacentHTML("beforeend",`<details class="part-records" open><summary>\u5DF2\u77E5\u51E0\u4F55\u7F3A\u53E3</summary>${r}<p>\u8FD9\u4E9B\u533A\u57DF\u5C1A\u672A\u5B8C\u6210\u5B9E\u666F\u5F62\u72B6\u9A8C\u6536\u3002</p></details>`)}if(i.detail_profile){let r=i.detail_sources.map(a=>`<a href="${bt(a.url)}" target="_blank" rel="noreferrer">\u7167\u7247\u53C2\u8003 \u2197</a>`).join(" \xB7 ");Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5C40\u90E8\u7167\u7247\u7EC6\u8282</strong>\uFF1A${bt(i.detail_profile.description_zh||"\u6A2A\u5411\u7A97\u5E26"+(i.detail_profile.pv_zones.length?"\u3001\u5C4B\u9876\u5149\u4F0F\u8986\u76D6\u533A":"")+"\u3002\u4F4D\u7F6E\u5BF9\u5E94\u516C\u5F00\u8F6E\u5ED3\uFF0C\u7EC6\u8282\u5C3A\u5BF8\u4E0E\u989C\u8272\u4E3A\u7167\u7247\u4F30\u7B97\u3002")}\u62CD\u6444\u65E5\u671F\u672A\u77E5\u3002\u8FD1\u666F\u53CA\u6807\u51C6\u6863\u53EF\u89C1\u3002</p><p>${r}</p>`)}if(i.photo_volume&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u7167\u7247\u4F30\u7B97\u4F53\u91CF</strong>\uFF1A${bt(i.photo_volume.summary_zh)}</p><p><strong>\u5C1A\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.photo_volume.remaining_zh)}</p>`),i.podium_photo&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u88D9\u697C\u66F2\u9762\u4F30\u7B97</strong>\uFF1A${bt(i.podium_photo.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.podium_photo.remaining_zh)}</p>`),i.library_terraces&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u53F0\u9636\u4E0E\u79CD\u690D\u4F30\u7B97</strong>\uFF1A${bt(i.library_terraces.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.library_terraces.remaining_zh)}</p>`),i.library_roof_edges&&Q("#detail-body").insertAdjacentHTML("beforeend",`<p><strong>\u5C4B\u9876\u8FB9\u5899\u4F30\u7B97</strong>\uFF1A${bt(i.library_roof_edges.summary_zh)}</p><p><strong>\u5F85\u6838\u5B9E</strong>\uFF1A${bt(i.library_roof_edges.remaining_zh)}</p>`),e){en!=="all"&&en!==i.phase&&bi(i.phase,!1);let r=new C(i.centroid[0],(i.display_height_m??i.height_m)/2,-i.centroid[1]),a=Math.max(120,Math.sqrt(i.area_m2)*3.4)*(innerWidth<760?1.5:1),o=new C(.7,.8,1),l=i.detail_profile?.view_edge!==void 0||i.detail_profile?.kind==="curtainwall"?i.detail_profile:i.detail_profile?.components?.find(u=>u.preferred_view)||i.detail_profile?.components?.find(u=>["residential_grid","curved_bands"].includes(u.kind));if(l){let u=l.view_edge!==void 0?l.edges.indexOf(l.view_edge):l.kind==="curved_bands"?Math.floor(l.anchors.length/2):0,[h,d]=l.anchors[u],f=Math.hypot(d[0]-h[0],d[1]-h[1]);o=new C((d[1]-h[1])/f,.8,(d[0]-h[0])/f)}ai();let c=a*o.length();if(o.normalize(),at.clientWidth<=760){let u=au(),h=Math.tan(ft.degToRad(Ke.fov/2)),d=Math.max(.2,(at.clientWidth-u.left-u.right)/at.clientWidth),f=Math.max(.12,(at.clientHeight-u.top-u.bottom)/at.clientHeight),m=new C().crossVectors(new C(0,1,0),o).normalize(),_=new C().crossVectors(o,m).normalize();for(let g of i.geometry)for(let[p,b]of g.outer)for(let x of[i.base_elevation_m,i.base_elevation_m+(i.display_height_m??i.height_m)]){let y=new C(p,x,-b).sub(r),E=y.dot(o);c=Math.max(c,Math.abs(y.dot(m))/(h*Ke.aspect*d*.82)+E,Math.abs(y.dot(_))/(h*f*.82)+E)}}Zt.move(r.clone().addScaledVector(o,c),r,oi),Mi=!1,nn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false"),oi&&Ei(ru())}pt.invalidate()}function Fd(i,e=!0){let t=Bt.buildings.find(n=>n.id===i.id);t?ea(t,e):Pb(i,e)}function Eg(i){if(!i?.nearby)return;let e=ri?.bounds||Ro;Si.setRegion([Math.min(e[0],i.centroid[0]-150),Math.min(e[1],i.centroid[1]-150),Math.max(e[2],i.centroid[0]+150),Math.max(e[3],i.centroid[1]+150)],4200)}function Wd(i,e=210){i.nearby?(Q("#show-surroundings").checked=!0,Co(),wi(),e=i.road?750:420):en!=="all"&&i.phase!==en&&bi(i.phase==="all"?"all":i.phase,!1);let t=new C(i.centroid[0],Math.min(60,i.labelHeight||0),-i.centroid[1]);Eg(i);let n=Ke.position.clone().sub(Ze.target).normalize();Zt.move(t.clone().addScaledVector(n,e),t,oi),Mi=!1,nn(Q("#top"),"top","\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed","false")}function Pb(i,e=!0){if(tn)return;hn=null,ji=i,gs(),Q("#building").value="",cu(),Q(".explore").classList.add("has-selection"),Q(".detail").hidden=!1,ai(),Q("#detail-title").textContent=i.name,Q("#detail-body").innerHTML=`<span class="badge">${i.nearby?"\u5B66\u6821\u5468\u8FB9":i.phase==="1"?"\u4E00\u671F":"\u4E8C\u671F"} \xB7 ${bt(li.find(([s])=>s===i.category)?.[1]||"\u5730\u70B9")}</span>`,du(Q("#detail-body"),i);let t=document.createElement("a");t.href=i.source_url,t.target="_blank",t.rel="noreferrer",t.className="source-link",t.textContent="\u67E5\u770B\u5730\u56FE\u8BB0\u5F55 \u2197",Q("#detail-body").append(t);let n=document.createElement("p");if(n.textContent=`\u5730\u70B9\u5FEB\u7167\uFF1A${(i.sourceTimestamp||Xn.sourceTimestamp).slice(0,10)}\u3002\u8425\u4E1A\u3001\u697C\u5C42\u548C\u901A\u884C\u60C5\u51B5\u4EE5\u73B0\u573A\u4E3A\u51C6\u3002`,Q("#detail-body").append(n),i.nearby){let s=document.createElement("p"),r=ri?.bounds,a=r&&(i.centroid[0]<r[0]||i.centroid[1]<r[1]||i.centroid[0]>r[2]||i.centroid[1]>r[3]);s.textContent=a?"\u8BE5\u5730\u70B9\u4F4D\u4E8E\u5DF2\u5EFA\u6A21\u533A\u57DF\u4E4B\u5916\uFF0C\u5F53\u524D\u663E\u793A\u6765\u6E90\u5730\u56FE\u7684\u4F4D\u7F6E\u6807\u6CE8\u3002":i.road?"\u9053\u8DEF\u8D70\u5411\u6765\u81EA\u516C\u5F00\u5730\u56FE\uFF0C\u663E\u793A\u5BBD\u5EA6\u4E3A\u793A\u610F\u3002":"\u5468\u8FB9\u5EFA\u7B51\u4EE5\u5730\u56FE\u8F6E\u5ED3\u663E\u793A\uFF0C\u9AD8\u5EA6\u4E0E\u5916\u5899\u5C1A\u672A\u5B9E\u6D4B\u3002",Q("#detail-body").append(s)}Bn.addActions(i),e&&Wd(i),ps.refresh(),pt.invalidate()}async function vg(){if(tn)return;let i=Q("#export-4k");i.disabled=!0,i.textContent="\u6B63\u5728\u751F\u6210 4K\u2026";let e=_s,t=wt.quality;Zt.cancel(),Ze.stopMotion(),Ze.enabled=!1,tn=!0;let n=Ke.aspect,s=Ke.view?{...Ke.view}:null,r=[...document.querySelectorAll(".explore button,.explore select,.explore input,.map-settings button,.map-settings select,.map-settings input,.map-tools button,.view-dock button,.render-studio button,.render-studio input,#close-detail")].map(l=>[l,l.disabled]);r.forEach(([l])=>l.disabled=!0);let a=$n,o=a?.visible;a&&(a.visible=!1);try{await Ei(0),a&&(a.visible=!1),wt.setQuality("ultra"),je.setPixelRatio(1),je.setSize(3840,2160,!1),wt.resize(3840,2160),Ke.clearViewOffset(),Ke.aspect=3840/2160,Ke.updateProjectionMatrix(),wt.updateShadows(!0),wt.updateEnvironment();let l=document.createElement("canvas");l.width=3840,l.height=2160;let c=l.getContext("2d",{alpha:!1});for(let d=0;d<16;d++){let[f,m]=Vm(d);Ke.setViewOffset(3840,2160,f,m,3840,2160),Po(),c.globalAlpha=1/(d+1),c.drawImage(je.domElement,0,0),i.textContent=`\u6B63\u5728\u6E32\u67D3 ${d+1} / 16\u2026`,Q("#studio-export").textContent=`\u6E32\u67D3 ${d+1} / 16`,d%2===1&&await new Promise(_=>setTimeout(_,0))}let u=l.toDataURL("image/png"),h=`BNBU-4K-${hn?.name||ji?.name||en}-${Date.now()}.png`;Ib(u,h)}catch(l){Bn.toast("\u5BFC\u51FA\u5931\u8D25\uFF1A"+l.message)}finally{Ke.aspect=n,s?Ke.setViewOffset(s.fullWidth,s.fullHeight,s.offsetX,s.offsetY,s.width,s.height):Ke.clearViewOffset(),Ke.updateProjectionMatrix(),a&&(a.visible=o),wt.setQuality(t),Zr=[0,0,0],To();try{await Ei(e)}finally{tn=!1,Ze.enabled=!0,r.forEach(([l,c])=>l.disabled=c),i.disabled=!1,i.textContent="\u4FDD\u5B58 4K \u753B\u9762",Q("#studio-export").textContent="\u6E32\u67D3 4K \u539F\u56FE",pt.invalidate()}}}function Ib(i,e){document.querySelector("#export-preview")?.remove();let t=document.createElement("dialog");t.id="export-preview",t.className="export-dialog",t.setAttribute("aria-label","4K \u753B\u9762\u9884\u89C8");let n=document.createElement("h2");n.textContent="4K \u753B\u9762\u5DF2\u751F\u6210";let s=document.createElement("p");s.textContent="3840 \xD7 2160 PNG \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 \u5F53\u524D\u89C6\u89D2\u4E0E\u5149\u7167";let r=document.createElement("img");r.id="export-preview-image",r.src=i,r.alt="\u5F53\u524D\u6821\u56ED\u89C6\u89D2\u7684 4K \u6E32\u67D3\u753B\u9762";let a=document.createElement("div");a.className="export-actions";let o=document.createElement("a");o.id="download-4k",o.href=i,o.download=e,o.textContent="\u4E0B\u8F7D PNG";let l=document.createElement("button");l.textContent="\u8FD4\u56DE\u5730\u56FE",l.onclick=()=>t.close(),a.append(o,l),t.append(n,s,r,a),document.body.append(t),t.addEventListener("close",()=>t.remove(),{once:!0}),t.showModal(),fetch(i).then(c=>c.blob()).then(c=>fetch("/api/exports",{method:"POST",headers:{"Content-Type":"image/png"},body:c})).then(async c=>{if(!c.ok)return;let u=await c.json();r.src=u.url,o.href=u.url+"?download=1",s.textContent="3840 \xD7 2160 PNG \xB7 16 \u6B21\u8FB9\u7F18\u91C7\u6837 \xB7 \u5DF2\u4FDD\u5B58\u5230\u672C\u5730"}).catch(()=>{})}function au(){if(new URLSearchParams(location.search).get("surface")==="explore"&&parent!==window){let s=[...parent.document.querySelectorAll(".map-p0-dock,.v2-explorer-panel,.map-p1-route")].map(r=>r.getBoundingClientRect()).filter(r=>r.width&&r.height);return innerWidth<900?{left:16,right:60,top:140,bottom:Math.max(140,...s.map(r=>innerHeight-r.top+16))}:{left:16,right:Math.max(80,...s.filter(r=>r.left>innerWidth/2).map(r=>r.width+40)),top:140,bottom:80}}let i=at.clientWidth<=760,e=Q(".explore").getBoundingClientRect(),t=Q(".render-studio"),n=t&&!t.hidden?t.getBoundingClientRect().width:0;return i&&n?{left:12,right:46,top:60,bottom:Math.min(at.clientHeight*.46,t.getBoundingClientRect().height)+112}:i?{left:12,right:60,top:e.bottom+12,bottom:Q(".detail").hidden?64:Math.min(240,Q(".detail").getBoundingClientRect().height)+80}:{left:e.right+24,right:Math.max(n?n+40:80,Q(".detail").hidden?80:Q(".detail").getBoundingClientRect().width+40),top:24,bottom:80}}function ai(){if(!Ke)return;let{left:i,right:e,top:t,bottom:n}=au(),s=at.clientWidth,r=at.clientHeight;Ke.setViewOffset(s,r,-(i-e)/2,-(t-n)/2,s,r),pt?.invalidate()}function Db(){Mi=!Mi;let i=Ze.target.clone(),e=Ke.position.distanceTo(i),t=new C(...Mi?[0,1,1e-5]:[.55,.82,.8]).normalize();Zt.move(i.clone().addScaledVector(t,e),i),nn(Q("#top"),"top",Mi?"\u900F\u89C6":"\u4FEF\u89C6"),Q("#top").setAttribute("aria-pressed",String(Mi))}function bg(i){tn||(Zt.cancel(),Ze.zoomBy(i))}var yn;function Lb(i){if(tn||!yn||yn.dragged||i.pointerId!==yn.id||i.button!==0||i.ctrlKey||i.metaKey||i.shiftKey||Math.hypot(i.clientX-yn.x,i.clientY-yn.y)>5)return;let e=je.domElement.getBoundingClientRect();xg.set((i.clientX-e.left)/e.width*2-1,-(i.clientY-e.top)/e.height*2+1),yg.setFromCamera(xg,Ke);let t=yg.intersectObject(Tn,!0).filter(n=>{for(let s=n.object;s;s=s.parent)if(!s.visible)return!1;return!0});for(let n of t){let s=Rm(n),r=Bt.buildings.find(a=>a.id===(s.id||s.building_id));if(r){ea(r);return}}}function To(){ms.resize++;let i=at.getBoundingClientRect(),e=Math.max(1,Math.floor(i.width)),t=Math.max(1,Math.floor(i.height)),n=tg(wt?.quality||"high",e,t,devicePixelRatio,wo);Zr[0]===e&&Zr[1]===t&&Zr[2]===n||(Zr=[e,t,n],ms.resizeApplied++,je.setPixelRatio(n),je.setSize(e,t),wt?.resize(Math.floor(e*n),Math.floor(t*n)),Ke.aspect=e/t,Ke.updateProjectionMatrix(),ai(),pt?.invalidate())}function Po(){let i=performance.now();je.shadowMap.needsUpdate&&kd++,je.info.reset(),wt?wt.render(!tn&&(su||Zt.active||Wi)):je.render(Yn,Ke),ps?.update(),Eo++,tn&&Bd.push(performance.now()-i)}function Tg(i=!1){let e=Zs.length?Zs.reduce((n,s)=>n+s[1],0)/Zs.length:0,t=i?"\u9759\u6B62\u89C6\u56FE":e?`${(1e3/e).toFixed(0)} FPS`:"\u6B63\u5728\u7ED8\u5236";Q("#metrics").textContent=`${t} \xB7 ${je.info.render.triangles.toLocaleString()} \u4E09\u89D2\u9762 \xB7 ${je.info.render.calls} \u7ED8\u5236/\u5E27`,Q("#render-state").textContent=`${i?"\u5DF2\u6682\u505C\u91CD\u7ED8":tn?"\u8FDE\u7EED\u91C7\u6837":"\u6309\u9700\u7ED8\u5236"} \xB7 \u7D2F\u8BA1 ${Eo} \u5E27`}function Ub(i){if(!oi)return!1;let e=Qc===null?0:i-Qc;Qc=i,e>0&&(Zs.push([i,e]),Zs=Zs.filter(l=>i-l[0]<=5e3).slice(-360));let t=Zt.active,n=Zt.update(i),s=t?n:zd.update(i);su=s,(s||Wi||n)&&(tu=i,e>0&&document.visibilityState==="visible"&&(So.push(e),So.length>600&&So.shift()));let r=fs.lightweight&&!tn&&(s||Wi||i-tu<180);r!==wo&&(wo=r,To()),!s&&!Wi&&(wt?.updateShadows(),Tn&&wt?.updateEnvironment()),n||Si.constrain(),s&&ms.controlsMoving++;let a=ru();a!==_s&&!tn&&!s&&!n&&!Wi&&Ei(a,!0).catch(eu);let o=Sg?.update(i,tn);if(Po(),i-gg>600&&(Tg(),gg=i,So.length)){let l=[...So].sort((c,u)=>c-u);at.dataset.gestureTiming=JSON.stringify({samples:l.length,medianMs:+l[Math.floor(l.length/2)].toFixed(1),p95Ms:+l[Math.ceil(l.length*.95)-1].toFixed(1),maxMs:+l.at(-1).toFixed(1),scope:"visible browser animation frames during motion, not physical-device GPU timing"})}return Q("#north").style.transform=`rotate(${-Ze.getAzimuthalAngle()*180/Math.PI}deg)`,at.dataset.motionResolution=String(wo),at.dataset.pixelRatio=String(je.getPixelRatio()),s||o||wo}async function Nb(){if(tn||!Ao)return;tn=!0,Q("#run-qa").disabled=!0,Q("#run-qa").textContent="\u6B63\u5728\u68C0\u67E5\u2026",Zt.cancel();let i=[...document.querySelectorAll(".explore button,.explore select,.explore input,.map-settings button,.map-settings select,.map-settings input,.map-tools button,.view-dock button,.render-studio button,.render-studio input,.map-label,#close-detail,#qa-duration")];i.forEach(e=>e.disabled=!0),Ze.enabled=!1;try{let e={app:"BNBU campus viewer",viewerVersion:zc,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,viewport:{width:at.clientWidth,height:at.clientHeight,dpr:devicePixelRatio,windowInnerSize:[innerWidth,innerHeight]},navigation:{mode:at.dataset.dragMode,target:Ze.target.toArray(),camera:Ke.position.toArray(),distance:Ke.position.distanceTo(Ze.target),polarDegrees:ft.radToDeg(Ze.getPolarAngle()),minDistance:Ze.minDistance,maxDistance:Si.maxDistance,bounds:Si.bounds},loadMs:Math.round(Ao-Mg),webgl:je.capabilities.isWebGL2?"WebGL2":"unknown",models:[],errors:[...Jr],limitations:["Current desktop browser only; viewport tests do not establish physical mobile-device acceptance.","Spatial baseline with partial photo-estimated detail; no surveyed terrain or complete facades."]};e.visualQuality={...wt.diagnostics(),materials:Qr.counts,textureLibrary:Qr.textureLibrary,photoArchitecture:Tn?.userData.photoArchitecture,surroundings:nu?.diagnostics};let t=await(await fetch("/evidence/build-report.json")).json(),n=await(await fetch("/campus-map/data/processed/paint-material/material.json")).json(),s=_s;for(let d=0;d<3;d++){Q("#run-qa").textContent=`\u6838\u5BF9 LOD ${d}\u2026`,await Ei(d),Po();let m=new Ot().setFromObject(Tn).getSize(new C),_=je.info.render.calls,g=je.info.render.triangles,p=0;Tn.traverse(I=>{I.isMesh&&p++});let b=await(await fetch(`/campus-map/exports/campus-lod${d}.glb`)).arrayBuffer(),x=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",b))).map(I=>I.toString(16).padStart(2,"0")).join(""),y=t.exports.find(I=>I.file===`campus-lod${d}.glb`),E=y?.sha256===x&&y.bytes===b.byteLength,A=await Pm(Tn,qd,d,n);e.models.push({lod:d,sha256:x,bytes:b.byteLength,matchesBuild:E,meshCount:p,paintTextures:A,runtimeBatching:Tn.userData.runtimeBatching,boundsMetres:m.toArray().map(I=>+I.toFixed(3)),renderCalls:_,renderTriangles:g,finiteBounds:m.toArray().every(Number.isFinite)})}await Ei(s),Po(),e.samplingContext={lod:s,view:en,selectionId:hn?.id??null,renderCalls:je.info.render.calls,renderTriangles:je.info.render.triangles,renderPixelRatio:je.getPixelRatio(),drawingBufferPixels:je.getDrawingBufferSize(new ce).toArray()};let r=Number(Q("#qa-duration").value);Q("#run-qa").textContent=`\u91C7\u6837\u81F3\u5C11 ${r/1e3} \u79D2\uFF0C\u8BF7\u4FDD\u6301\u9875\u9762\u6FC0\u6D3B\u2026`;let a=Eo;Bd=[];let o=kd;pt.setContinuous(!0),e.frameTime=await Sm(void 0,r),e.renderActivity={mode:"forced-continuous-for-qa",renderedFrames:Eo-a};let l=[...Bd].sort((d,f)=>d-f);e.renderWork={scope:"Main-thread renderer submission and labels, not GPU completion or refresh rate",samples:l.length,averageMs:l.length?l.reduce((d,f)=>d+f,0)/l.length:null,p95Ms:l[Math.ceil(l.length*.95)-1]??null,shadowUpdatesDuringSampling:kd-o},pt.setContinuous(!1),Q("#run-qa").textContent="\u68C0\u67E5\u9759\u6B62\u65F6\u662F\u5426\u505C\u6B62\u7ED8\u5236\u2026";let c={...ms};e.idleRendering=await Tm(()=>({idle:pt.idle,renderedFrames:Eo})),e.idleRendering.eventCounts=Object.fromEntries(Object.keys(ms).map(d=>[d,ms[d]-c[d]])),e.selection={id:hn?.id??null,title:Q("#detail-title").textContent},e.currentView=en,e.resources=performance.getEntriesByType("resource").map(d=>({url:d.name,bytes:d.transferSize,durationMs:+d.duration.toFixed(2)})),e.assetStatus=e.models.every(d=>d.meshCount>0&&d.finiteBounds&&d.matchesBuild&&d.paintTextures.pass)&&!Jr.length?"PASS":"FAIL",e.performanceStatus=e.frameTime.valid?"MEASURED":"INCONCLUSIVE",e.status=e.assetStatus!=="PASS"||e.idleRendering.status==="FAIL"?"FAIL":e.frameTime.valid&&e.idleRendering.status==="PASS"?"PASS":"PASS_WITH_LIMITS";let u=await fetch("/api/evidence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!u.ok)throw Error("Cannot save evidence: HTTP "+u.status);let h=await u.json();e.saved=h.saved,Q("#qa-report").textContent=JSON.stringify(e,null,2),Q("#run-qa").textContent=e.status==="PASS"?"\u52A0\u8F7D\u901A\u8FC7 \xB7 \u91C7\u6837\u5B8C\u6210":e.status==="PASS_WITH_LIMITS"?"\u52A0\u8F7D\u901A\u8FC7 \xB7 \u6027\u80FD\u5F85\u590D\u6D4B":"\u68C0\u67E5\u53D1\u73B0\u95EE\u9898"}catch(e){Q("#qa-report").textContent=String(e.stack),Q("#run-qa").textContent="\u9A8C\u6536\u5931\u8D25",Jr.push(String(e))}finally{pt.setContinuous(!1),tn=!1,Q("#run-qa").disabled=!1,i.forEach(e=>e.disabled=!1),Ze.enabled=!0,pt.invalidate()}}function eu(i){parent.postMessage({type:"huitongli-map-error"},location.origin),Jr.push(String(i)),Q("#loading").style.display="flex",Q("#loading").innerHTML=`<strong>\u6A21\u578B\u52A0\u8F7D\u5931\u8D25</strong><span>${bt(i.message||i)}</span><span>\u8BF7\u8FD0\u884C npm start\uFF0C\u5E76\u5237\u65B0\u9875\u9762\u3002</span>`,jd.textContent="\u52A0\u8F7D\u5931\u8D25"}async function Fb(){try{let l=function(u){Cd(Ze,u),at.dataset.dragMode=u,document.querySelectorAll("button[data-drag-mode]").forEach(h=>h.setAttribute("aria-pressed",String(h.dataset.dragMode===u))),Q("#drag-help").textContent=u==="pan"?"\u5DE6\u952E / \u5355\u6307\u62D6\u52A8\u5E73\u79FB \xB7 \u53F3\u952E\u65CB\u8F6C":"\u5DE6\u952E / \u5355\u6307\u62D6\u52A8\u65CB\u8F6C \xB7 \u53F3\u952E\u5E73\u79FB",Q("#touch-help").textContent=u==="pan"?"\u53CC\u6307\u7F29\u653E\u4E0E\u65CB\u8F6C":"\u53CC\u6307\u7F29\u653E\u4E0E\u5E73\u79FB"};Bt=fg,at.dataset.dataReadyMs=String(Math.round(performance.now())),je=new Pc({antialias:!0,alpha:!1,powerPreference:"high-performance"}),je.setPixelRatio(Math.min(devicePixelRatio,1.75)),je.setClearColor(15133927),je.outputColorSpace=Rt,je.toneMapping=Fr,je.toneMappingExposure=new URLSearchParams(location.search).get("surface")==="explore"?.94:.85,je.shadowMap.enabled=!0,je.shadowMap.type=Ja,je.shadowMap.autoUpdate=!1,at.appendChild(je.domElement),je.domElement.setAttribute("aria-label","\u62D6\u52A8\u5E73\u79FB\u3001\u6EDA\u8F6E\u7F29\u653E\u3001\u70B9\u51FB\u5EFA\u7B51\uFF1B\u53EF\u5207\u6362\u65CB\u8F6C\u6A21\u5F0F"),Yn=new Cs,Ke=new It(42,innerWidth/innerHeight,1,12e3),Ze=new Uc(Ke,je.domElement,{reducedMotion:()=>matchMedia("(prefers-reduced-motion: reduce)").matches}),Ze.panSpeed=.8,Ze.rotateSpeed=.65,Ze.zoomSpeed=.8,Si=Om(Ke,Ze),Ze.getMaxZoomDistance=()=>Si.maxDistance,pt=wm({render:Ub,onError:eu,onIdle:()=>{Ze.rest(),Zs=[],Qc=null,Tg(!0),Ao&&Bn?.saveView()}}),zd=Em(Ze,Ke),Zt=Fm({camera:Ke,controls:Ze,invalidate:()=>pt.invalidate()}),Ze.addEventListener("wake",()=>pt.invalidate()),Ze.addEventListener("change",()=>{Zt.active||Si.constrain(),ms.controlChange++,zd.updating||pt.invalidate()}),Ze.addEventListener("start",()=>{Wi=!0,Kc=!0,tu=performance.now(),je.domElement.classList.add("dragging")}),Ze.addEventListener("end",()=>{Wi=!1,je.domElement.classList.remove("dragging"),pt.invalidate()}),wt=ig({renderer:je,scene:Yn,camera:Ke,controls:Ze,invalidate:()=>pt.invalidate(),initialQuality:fs.quality,deferEnvironment:!0}),je.info.autoReset=!1,Q("#quality").value=fs.quality,at.dataset.deviceProfile=fs.lightweight?"mobile":"desktop";let i=new it(new Fi(16e3,16e3),Qr.material(new Wt({name:"Engineering datum background",color:12765883,roughness:1})));i.rotation.x=-Math.PI/2,i.position.y=-.3,i.receiveShadow=!0,Yn.add(i),Hd=i,Cd(Ze,"pan"),at.dataset.dragMode="pan",ef({invalidate:()=>{ai(),pt.invalidate()}}),Q("#zoom-in").addEventListener("click",()=>{Kc=!0,bg(.72)}),Q("#zoom-out").addEventListener("click",()=>{Kc=!0,bg(1/.72)}),window.addEventListener("resize",To),To(),bi("all");let e=bo(location.hash,Bt.buildings);if(!e)try{let u=JSON.parse(localStorage.getItem("campus-view"));u&&(e=bo(vo(u),Bt.buildings))}catch{}e?.target&&e.position&&(bi(e.view||"all",!1),Zt.move(new C(...e.position),new C(...e.target),!1),_g=!0),await Ei(2),at.dataset.assetsReadyMs=String(Math.round(performance.now())),wt.updateShadows(),await wt.compileScene(),at.dataset.shadersReadyMs=String(Math.round(performance.now())),Po(),oi=!0,Ao=performance.now(),at.dataset.finishesReady="false",Q("#loading").style.display="none",at.dataset.readyMs=String(Math.round(performance.now())),pt.invalidate(),await Ab();let t=Promise.all(["campus-places","surroundings","reference-places","viewer-campus"].map(async u=>{let h=await fetch(hs(`/campus-map/data/processed/${u}.json`));if(!h.ok)throw Error("Dataset load failed: "+u);return h.json()})),n=(async()=>{await Promise.all([Jm(je,{mobile:fs.mobileTextures}).then(async u=>{await Kr(),Qr.setTextureLibrary(u),pt.invalidate()}),fs.loadEnvironment?wt.loadEnvironment({mobile:fs.mobileTextures,beforePrepare:Kr}):(async()=>{await Kr(),wt.prepareEnvironment()})()]),je.shadowMap.needsUpdate=!0,wt.invalidateEnvironment(),pt.invalidate(),at.dataset.finishesReady="true",at.dataset.finishesReadyMs=String(Math.round(performance.now()))})().catch(u=>console.warn("\u5730\u56FE\u5DF2\u53EF\u7528\uFF0C\u7EC6\u8282\u52A0\u8F7D\u5931\u8D25\uFF1A",u)),[s,r,a,o]=await t;await Kr(),Bt=o,Xn=s,ri=r,Xn.places.push(...ug(ri,Bt.buildings,Xn.places)),Xn.places=uf(Xn.places,a),Xn.referenceCounts=a.counts,Bt.buildings=rf(Bt.buildings,Xn.places),await tf([...Bt.buildings,...Xn.places].map(u=>u.display_name||u.name||"")),ri?(nu=hg(ri),Yn.add(nu.group)):(Q("#show-surroundings").checked=!1,Q("#show-surroundings").disabled=!0,Q('[data-search-scope="nearby"]').disabled=!0),Q("#show-surroundings").addEventListener("change",()=>{Co(),Si.constrain(),wi()}),Q("#quality").addEventListener("change",()=>{wt.setQuality(Q("#quality").value),Zr=[0,0,0],To()}),Gm({visuals:wt,exportImage:vg,invalidate:()=>{ai(),pt.invalidate()}}),cf({controls:Ze,focus:(u,h)=>{let d=[...Bt.buildings,...Xn.places].find(m=>m.id===h);if(d){Fd(d);return}bi("all",!1),Wd({centroid:u,labelHeight:2,phase:"all",nearby:!0});let f=ri?.bounds||Ro;Si.setRegion([Math.min(f[0],u[0]-150),Math.min(f[1],u[1]-150),Math.max(f[2],u[0]+150),Math.max(f[3],u[1]+150)],4200)}}),Sg=km({scene:Yn,camera:Ke,controls:Ze,visuals:wt,invalidate:()=>pt.invalidate()}),Q("#export-4k").addEventListener("click",vg),Q("#mobile-tools-toggle").onclick=()=>{let u=Q(".explore").classList.toggle("tools-expanded");Q("#mobile-tools-toggle").setAttribute("aria-expanded",String(u)),Q("#mobile-tools-toggle").setAttribute("aria-label",u?"\u6536\u8D77\u7B5B\u9009":"\u5C55\u5F00\u7B5B\u9009"),Q("#mobile-tools-toggle").title=u?"\u6536\u8D77\u7B5B\u9009":"\u5C55\u5F00\u7B5B\u9009"};for(let u of Bt.buildings){let h=document.createElement("option");h.value=u.id,h.textContent=`${u.phase}\u671F \xB7 ${u.display_name||u.name}`,Q("#building").appendChild(h)}Q("#building-count").innerHTML=`${Bt.stats.buildings}<small>\u5DF2\u6536\u5F55\u5EFA\u7B51\u4E0E\u6784\u7B51\u7269</small>`,document.querySelectorAll("[data-view]").forEach(u=>u.addEventListener("click",()=>{ps.scope==="nearby"&&ps.setScope("buildings"),bi(u.dataset.view)})),ps=Nm({buildings:Bt.buildings,places:Xn.places,camera:Ke,controls:Ze,stage:at,choose:Fd,invalidate:()=>pt.invalidate(),onScopeChange:u=>{u==="nearby"&&Cb()},getState:()=>({view:en,surroundingsEnabled:Q("#show-surroundings").checked,selected:ji?.id||hn?.id,construction:Q("#construction").checked,...Bn?.state})}),Bn=og({buildings:Bt.buildings,placeData:Xn,camera:Ke,controls:Ze,scene:Yn,choose:Fd,focusPoint:Wd,restoreView:u=>{bi(u.view||"all",!1),Eg(ji),Zt.move(new C(...u.position),new C(...u.target),oi)},getView:()=>({view:en,target:Ze.target.toArray(),position:Ke.position.toArray(),place:ji?.id||hn?.id||null}),applyLayers:()=>wi(),refresh:()=>ps.refresh(),invalidate:()=>pt.invalidate()}),Q("#top").addEventListener("click",Db),Q("#reset").addEventListener("click",()=>{hn=null,gs(),Ks(),bi(en,!1)}),Q("#quick-reset").onclick=()=>Q("#reset").click(),document.querySelectorAll("button[data-drag-mode]").forEach(u=>u.addEventListener("click",()=>l(u.dataset.dragMode))),l("pan"),Q("#close-detail").addEventListener("click",()=>{hn=null,gs(),Ks()}),Q("#compass").addEventListener("click",()=>{if(tn)return;let u=Ke.position.clone().sub(Ze.target),h=u.length(),d=Ze.getPolarAngle();u.set(0,Math.cos(d)*h,Math.sin(d)*h),Zt.move(Ze.target.clone().add(u),Ze.target)}),typeof ResizeObserver<"u"&&(new ResizeObserver(()=>ai()).observe(Q(".explore")),new ResizeObserver(()=>ai()).observe(Q(".detail"))),Q("#building").addEventListener("change",()=>ea(Bt.buildings.find(u=>u.id===Q("#building").value))),Q("#lod").addEventListener("change",()=>{Q("#evidence-colors").checked&&Q("#lod").value==="2"&&(Q("#lod").value="1"),Ei(ru())}),Q("#construction").addEventListener("change",()=>{!Q("#construction").checked&&hn?.construction_status==="construction_unverified"&&(hn=null,gs(),Ks()),wi()}),Q("#evidence-colors").addEventListener("change",async()=>{Q("#evidence-colors").checked&&(Q("#lod").value="1",await Ei(1)),wi()}),Q("#run-qa").addEventListener("click",Nb);let c=new Set;je.domElement.addEventListener("pointerdown",u=>{c.add(u.pointerId),c.size===1?yn={x:u.clientX,y:u.clientY,id:u.pointerId,dragged:!1}:yn&&(yn.dragged=!0)}),je.domElement.addEventListener("pointermove",u=>{yn&&u.pointerId===yn.id&&Math.hypot(u.clientX-yn.x,u.clientY-yn.y)>5&&(yn.dragged=!0)}),je.domElement.addEventListener("pointerup",u=>{Lb(u),c.delete(u.pointerId),c.size||(yn=null)}),je.domElement.addEventListener("pointercancel",u=>{c.delete(u.pointerId),yn=null,je.domElement.classList.remove("dragging")}),je.domElement.addEventListener("webglcontextlost",u=>{u.preventDefault(),pt.dispose(),eu(Error("WebGL context lost; reload to recover"))}),Co(),wi(),await Bn.restore({preserveCamera:_g||Kc}),Q("#run-qa").disabled=!1,pt.invalidate(),at.dataset.detailsReadyMs=String(Math.round(performance.now())),await n,at.dataset.loadTrace=JSON.stringify(performance.getEntriesByType("resource").filter(u=>/campus\.bundle|\.glb|\/materials\/|\/processed\/|\/assets\/|\/search\//.test(u.name)).map(u=>({url:new URL(u.name).pathname,start:Math.round(u.startTime),end:Math.round(u.responseEnd),bytes:u.transferSize})))}catch(i){oi?(console.warn("\u5730\u56FE\u5DF2\u53EF\u7528\uFF0C\u5730\u70B9\u8D44\u6599\u6682\u672A\u8865\u9F50\uFF1A",i),jd.textContent="\u5730\u56FE\u5DF2\u6253\u5F00\uFF0C\u5730\u70B9\u8D44\u6599\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u5237\u65B0\u91CD\u8BD5"):eu(i)}}var Od,Ag=i=>parent.postMessage(i,location.origin),Ob=ea;ea=function(i,e=!0){Ob(i,e),i&&(new URLSearchParams(location.search).get("surface")==="explore"&&(document.getElementById("search-results").hidden=!0),Ag({type:"huitongli-map-selected",id:i.id}))};window.addEventListener("message",i=>{i.origin!==location.origin||i.source!==parent||i.data?.type!=="huitongli-map-command"||!oi||(i.data.action==="layout"&&ai(),i.data.action==="route"&&(Od??(Od=pg({THREE:{Group:Dt,Vector3:C,CurvePath:Dr,LineCurve3:Ir,Mesh:it,TubeGeometry:Ba,MeshBasicMaterial:Gt,SphereGeometry:Us,Box3:Ot},scene:Yn,camera:Ke,controls:Ze,invalidate:()=>pt.invalidate(),padding:au})),i.data.points===null?Od.clear():Od.show(i.data.points),ai()),i.data.action==="dismiss"&&(document.getElementById("close-detail")?.click(),Ke.clearViewOffset(),pt.invalidate()),i.data.action==="focus"&&ea(Bt.buildings.find(e=>e.id===i.data.id)),i.data.action==="overview"&&(hn=null,gs(),Ks(),Ke.clearViewOffset(),bi("all",!1)))});Fb().then(()=>{oi&&Ag({type:"huitongli-map-ready",buildings:[{id:"way/1081327620",name:"V29 \u5BB9\u95F3\u697C"},{id:"way/1201625876",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625876"},{id:"way/1201625882",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625882"},{id:"way/1201625883",name:"\u672A\u547D\u540D\u5EFA\u7B51 1201625883"},{id:"way/1202303549",name:"\u672A\u547D\u540D\u5EFA\u7B51 1202303549"},{id:"way/1206553328",name:"\u672A\u547D\u540D\u5EFA\u7B51 1206553328"},{id:"way/1206553329",name:"\u672A\u547D\u540D\u5EFA\u7B51 1206553329"},{id:"way/1215697328",name:"\u672A\u547D\u540D\u5EFA\u7B51 1215697328"},{id:"way/1215983507",name:"\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3\uFF08\u4E00\u671F\uFF09"},{id:"way/664082908",name:"T2 \u4EBA\u6587\u697C"},{id:"way/664082909",name:"T3 \u683C\u7269\u697C"},{id:"way/664082910",name:"T1 \u539A\u5FB7\u697C"},{id:"way/664082911",name:"\u6F14\u827A\u5385"},{id:"way/664082912",name:"\u884C\u653F\u697C"},{id:"way/664082913",name:"\u5927\u5B66\u4F1A\u5802"},{id:"way/664082915",name:"\u4F53\u80B2\u9986"},{id:"way/664093255",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093255"},{id:"way/664093256",name:"T4 \u6559\u5B66\u697C"},{id:"way/664093257",name:"T5 \u6559\u5B66\u697C"},{id:"way/664093258",name:"T6 \u6559\u5B66\u697C"},{id:"way/664093260",name:"T7 \u6559\u5B66\u697C"},{id:"way/664093261",name:"T8 \u535A\u7B80\u697C"},{id:"way/664093272",name:"V28 \u838E\u7FC1\u697C"},{id:"way/664093273",name:"V27 \u96E8\u679C\u697C"},{id:"way/664093274",name:"\u6986\u6808"},{id:"way/664093275",name:"V26 \u6B4C\u5FB7\u697C"},{id:"way/664093276",name:"V25 \u4E1C\u5761\u697C"},{id:"way/664093277",name:"V23 \u96EA\u82B9\u697C"},{id:"way/664093278",name:"V24 \u9633\u660E\u697C"},{id:"way/664093279",name:"\u4F1A\u8D24\u90A8\u5F85\u6838\u4F4E\u5C42\u8F6E\u5ED3"},{id:"way/664093280",name:"V20 \u7B03\u884C\u697C"},{id:"way/664093281",name:"V19 \u771F\u77E5\u697C"},{id:"way/664093282",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093282"},{id:"way/664093283",name:"V21 \u535A\u6587\u697C"},{id:"way/664093284",name:"\u672A\u547D\u540D\u5EFA\u7B51 664093284"},{id:"way/664093285",name:"V22 \u96C5\u5FD7\u697C"},{id:"way/664093286",name:"V18 \u62B1\u6734\u697C"},{id:"way/664093287",name:"V17 \u4EC1\u7231\u697C"},{id:"way/664093288",name:"V16 \u5C1A\u8D24\u697C"},{id:"way/664093289",name:"V15 \u660E\u5FC3\u697C"},{id:"way/664093290",name:"\u6587\u5316\u521B\u610F\u7FA4\u843D"},{id:"way/664093294",name:"T29 \u6559\u5B66\u697C"},{id:"relation/16121437",name:"D3 \u4E50\u96C5\u82D1"},{id:"relation/16121438",name:"D4"},{id:"relation/16121439",name:"D1 \u96CD\u96C5\u82D1"},{id:"relation/16121440",name:"D2"},{id:"relation/16123936",name:"D6 \u6B63\u96C5\u82D1"},{id:"relation/16123937",name:"D5 \u5B8F\u96C5\u82D1"},{id:"relation/18706867",name:"\u672A\u547D\u540D\u5EFA\u7B51 18706867"},{id:"relation/19666480",name:"\u672A\u547D\u540D\u5EFA\u7B51 19666480"},{id:"relation/19971851",name:"\u672A\u547D\u540D\u5EFA\u7B51 19971851"},{id:"relation/19971852",name:"\u672A\u547D\u540D\u5EFA\u7B51 19971852"},{id:"way/1191618600",name:"\u9AD8\u7B49\u7814\u7A76\u9662"},{id:"way/1191618603",name:"\u672A\u547D\u540D\u5EFA\u7B51 1191618603"},{id:"way/1209647875",name:"\u672A\u547D\u540D\u5EFA\u7B51 1209647875"},{id:"way/1384048510",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048510"},{id:"way/1384048511",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048511"},{id:"way/1384048512",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048512"},{id:"way/1384048513",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048513"},{id:"way/1384048514",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384048514"},{id:"way/1384101157",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101157"},{id:"way/1384101158",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101158"},{id:"way/1384101159",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101159"},{id:"way/1384101160",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101160"},{id:"way/1384101161",name:"\u672A\u547D\u540D\u5EFA\u7B51 1384101161"},{id:"way/1388933765",name:"\u672A\u547D\u540D\u5EFA\u7B51 1388933765"},{id:"way/1434554451",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554451"},{id:"way/1434554454",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554454"},{id:"way/1434554455",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554455"},{id:"way/1434554456",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554456"},{id:"way/1434554457",name:"\u672A\u547D\u540D\u5EFA\u7B51 1434554457"},{id:"way/1446422779",name:"\u672A\u547D\u540D\u5EFA\u7B51 1446422779"},{id:"way/1446422780",name:"\u672A\u547D\u540D\u5EFA\u7B51 1446422780"},{id:"way/1459082762",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459082762"},{id:"way/1459105110",name:"\u4E1C\u5927\u95E8"},{id:"way/1459105119",name:"\u5B66\u4E60\u8D44\u6E90\u4E2D\u5FC3\uFF08\u4E8C\u671F\uFF09"},{id:"way/1459105120",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105120"},{id:"way/1459105121",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105121"},{id:"way/1459105140",name:"\u672A\u547D\u540D\u5EFA\u7B51 1459105140"}]})});
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
