import type { BookmarkNode } from '@/types';

function bm(title: string, url: string): BookmarkNode {
  return { id: `seed_${title}_${url}`, title, url, isFolder: false };
}
function folder(title: string, children: BookmarkNode[]): BookmarkNode {
  return { id: `seed_folder_${title}`, title, isFolder: true, children };
}

/** Default sample bookmarks shown on first visit (no import yet) */
export const seedBookmarks: BookmarkNode[] = [
  folder('常用工具', [
    folder('AI 助手', [
      bm('ChatGPT', 'https://chat.openai.com'),
      bm('Claude', 'https://claude.ai'),
      bm('Gemini', 'https://gemini.google.com'),
      bm('文心一言', 'https://yiyan.baidu.com'),
    ]),
    folder('效率办公', [
      bm('Notion', 'https://www.notion.so'),
      bm('飞书', 'https://www.feishu.cn'),
      bm('腾讯文档', 'https://docs.qq.com'),
      bm('Google 文档', 'https://docs.google.com'),
    ]),
    folder('设计创意', [
      bm('Figma', 'https://www.figma.com'),
      bm('Canva', 'https://www.canva.com'),
      bm('稿定设计', 'https://www.gaoding.com'),
      bm('Adobe Express', 'https://www.adobe.com/express'),
    ]),
  ]),
  folder('开发资源', [
    folder('前端', [
      bm('React', 'https://react.dev'),
      bm('Vue', 'https://vuejs.org'),
      bm('Tailwind CSS', 'https://tailwindcss.com'),
      bm('Vite', 'https://vitejs.dev'),
    ]),
    folder('后端', [
      bm('Node.js', 'https://nodejs.org'),
      bm('Deno', 'https://deno.land'),
      bm('Supabase', 'https://supabase.com'),
      bm('PostgreSQL', 'https://www.postgresql.org'),
    ]),
    folder('代码托管', [
      bm('GitHub', 'https://github.com'),
      bm('GitLab', 'https://gitlab.com'),
      bm('Gitee', 'https://gitee.com'),
      bm('CodePen', 'https://codepen.io'),
    ]),
    folder('学习平台', [
      bm('MDN Web Docs', 'https://developer.mozilla.org'),
      bm('Stack Overflow', 'https://stackoverflow.com'),
      bm('掘金', 'https://juejin.cn'),
      bm('V2EX', 'https://www.v2ex.com'),
    ]),
  ]),
  folder('资讯娱乐', [
    folder('新闻资讯', [
      bm('知乎', 'https://www.zhihu.com'),
      bm('微博', 'https://weibo.com'),
      bm('豆瓣', 'https://www.douban.com'),
      bm('36氪', 'https://36kr.com'),
    ]),
    folder('影音娱乐', [
      bm('YouTube', 'https://www.youtube.com'),
      bm('Bilibili', 'https://www.bilibili.com'),
      bm('Netflix', 'https://www.netflix.com'),
      bm('Spotify', 'https://www.spotify.com'),
    ]),
  ]),
  folder('生活服务', [
    folder('购物', [
      bm('淘宝', 'https://www.taobao.com'),
      bm('京东', 'https://www.jd.com'),
      bm('拼多多', 'https://www.pinduoduo.com'),
      bm('Amazon', 'https://www.amazon.com'),
    ]),
    folder('出行', [
      bm('高德地图', 'https://www.amap.com'),
      bm('携程旅行', 'https://www.ctrip.com'),
      bm('12306', 'https://www.12306.cn'),
      bm('飞猪', 'https://www.fliggy.com'),
    ]),
  ]),
];
