// Lager Android-prosjektet (Trusted Web Activity) for Zniff fra innstillingene under.
const {TwaManifest,TwaGenerator,ConsoleLog}=require('@bubblewrap/core');
const path=require('path'),fs=require('fs');
const BASE=process.env.ZNIFF_BASE||'https://chrwergeland-dotcom.github.io/sokskart/zniff/';
const u=new URL(BASE),DARK='#0B0B0C';
const cfg={
  packageId:'no.wergeland.zniff',host:u.host,name:'Zniff',launcherName:'Zniff',display:'standalone',orientation:'default',
  themeColor:DARK,themeColorDark:DARK,navigationColor:DARK,navigationColorDark:DARK,navigationDividerColor:DARK,navigationDividerColorDark:DARK,backgroundColor:DARK,
  enableNotifications:false,startUrl:u.pathname,fullScopeUrl:BASE,webManifestUrl:BASE+'manifest.webmanifest',
  iconUrl:(process.env.ZNIFF_ICONS||BASE)+'icon-512.png',maskableIconUrl:(process.env.ZNIFF_ICONS||BASE)+'icon-512.png',
  splashScreenFadeOutDuration:300,signingKey:{path:'./unused.keystore',alias:'zniff'},
  appVersionName:process.env.ZNIFF_VERSION||'1.0.0',appVersionCode:+(process.env.ZNIFF_CODE||1),appVersion:process.env.ZNIFF_VERSION||'1.0.0',
  shortcuts:[],generatorApp:'bubblewrap-core',fallbackType:'customtabs',enableSiteSettingsShortcut:true,isChromeOSOnly:false,isMetaQuest:false,
  minSdkVersion:23,features:{playBilling:{enabled:true}},alphaDependencies:{enabled:true},additionalTrustedOrigins:[],retainedBundles:[]
};
(async()=>{
  const out=path.resolve(process.argv[2]||'android');fs.mkdirSync(out,{recursive:true});
  const m=new TwaManifest(cfg);const err=m.validate();if(err){console.error('Ugyldig oppsett:',err);process.exit(1)}
  await new TwaGenerator().createTwaProject(out,m,new ConsoleLog('zniff'));
  fs.writeFileSync(path.join(out,'twa-manifest.json'),JSON.stringify(m.toJson(),null,1));
  console.log('OK',out);
})().catch(e=>{console.error(e);process.exit(1)});
