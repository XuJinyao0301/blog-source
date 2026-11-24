/* global hexo */

// Keep the existing index generator's paths, metadata and pagination. Only
// the root route gets the new layout, and the old layout remains a fallback.
const originalIndex = hexo.extend.generator.get('index');
if (originalIndex) {
  hexo.extend.generator.register('index', function (locals) {
    return originalIndex.call(this, locals).then(routes => routes.map(route => {
      if (this.route.format(route.path) !== 'index.html') return route;
      return { ...route, layout: ['enervate', ...[].concat(route.layout || [])] };
    }));
  });
}

hexo.extend.helper.register('enervate_home', function () {
  const link = path => this.url_for(path);
  const sections = [
    { id: 'research', path: 'projects/index.html', title: '研究方向' },
    { id: 'about', path: 'about/index.html', title: '关于' }
  ].flatMap(({ id, path, title }) => {
    const page = this.site.pages.findOne({ path });
    return page ? [{ id, title: page.title || title, content: page.content }] : [];
  });

  return {
    sections,
    root: link('/'),
    canonical: this.url,
    asset: link('/enervate/'),
    links: {
      archives: link('/archives/'),
      categories: link('/categories/'),
      tags: link('/tags/'),
      now: link('/now/')
    },
    posts: this.site.posts.sort('date', -1).limit(18).map(post => ({
      title: post.title || '无标题',
      date: this.date(post.date, 'YYYY-MM-DD'),
      href: link(post.link || post.path),
      categories: post.categories.map(category => category.name),
      image: typeof post.cover === 'string' && post.cover.trim() && post.cover.trim() !== 'false'
        ? link(post.cover.trim())
        : null
    }))
  };
});
