import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import Breadcrumb from '../components/Breadcrumb';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const resourceArticles = content?.resourceArticles ?? [];
  const articleIndex = resourceArticles.findIndex((a) => a.slug === slug);
  const article = articleIndex >= 0 ? resourceArticles[articleIndex] : undefined;

  if (!article) {
    return (
      <div className="container-gxt py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-deep">Blog post not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please return to the blog and select an available post.
        </p>
        <Link
          to="/resources"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-lime"
        >
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
        <div className="container-gxt relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path={`resourceArticles.${articleIndex}.category`}>
            {article.category}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep" data-content-path={`resourceArticles.${articleIndex}.title`}>{article.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600" data-content-path={`resourceArticles.${articleIndex}.summary`}>{article.summary}</p>
          
          {/* Article Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>By <span data-content-path={`resourceArticles.${articleIndex}.author`}>{article.author}</span></span>
            <span>•</span>
            <span data-content-path={`resourceArticles.${articleIndex}.readTime`}>{article.readTime}</span>
            <span>•</span>
            <span>Published <span data-content-path={`resourceArticles.${articleIndex}.publishedOn`}>{article.publishedOn}</span></span>
          </div>
          
          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag, tagIndex) => (
              <span
                key={tag}
                className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
                data-content-path={`resourceArticles.${articleIndex}.tags.${tagIndex}`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <Link
            to="/resources"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
          >
            ← Back to blog
          </Link>
        </div>
      </section>
      <Breadcrumb />

      {/* Article Content */}
      <section className="container-gxt py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:items-start">
          {/* Main Content */}
          <div className="lg:order-1">
            {/* Featured Image */}
            <div className="mb-12">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-96 object-cover rounded-3xl shadow-lg"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-slate prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

          </div>

          {/* Right Sidebar */}
          <aside className="lg:order-2">
            <div className="sticky top-28 space-y-8">
              {/* Article Meta Info */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-deep mb-4">Article Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Author:</span>
                    <p className="mt-1 text-brand-deep" data-content-path={`resourceArticles.${articleIndex}.author`}>{article.author}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Category:</span>
                    <div className="mt-1">
                      <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium" data-content-path={`resourceArticles.${articleIndex}.category`}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Read Time:</span>
                    <p className="mt-1 text-brand-deep" data-content-path={`resourceArticles.${articleIndex}.readTime`}>{article.readTime}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Published:</span>
                    <p className="mt-1 text-brand-deep" data-content-path={`resourceArticles.${articleIndex}.publishedOn`}>{article.publishedOn}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-deep mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
                      data-content-path={`resourceArticles.${articleIndex}.tags.${tagIndex}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category Headlines */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-deep mb-4">{article.category} Articles</h3>
                <div className="space-y-3">
                  {resourceArticles
                    .filter((a) => a.category === article.category && a.slug !== article.slug)
                    .map((categoryArticle) => (
                      <Link
                        key={categoryArticle.slug}
                        to={`/resources/${categoryArticle.slug}`}
                        className="block group"
                      >
                        <div className="p-3 rounded-2xl border border-slate-100 hover:border-brand-primary/40 hover:bg-brand-lime/5 transition-colors">
                          <h4 className="text-sm font-semibold text-brand-deep group-hover:text-brand-primary line-clamp-2">
                            {categoryArticle.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">{categoryArticle.publishedOn}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Articles */}
      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <h2 className="text-2xl font-semibold text-brand-deep mb-8">Related Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resourceArticles
              .filter((a) => a.slug !== article.slug)
              .slice(0, 3)
              .map((relatedArticle, rIndex) => (
                <Link
                  key={relatedArticle.slug}
                  to={`/resources/${relatedArticle.slug}`}
                  className="group block"
                >
                  <article className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-0 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="h-40 w-full object-cover rounded-t-3xl"
                      loading="lazy"
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path={`resourceArticles.${rIndex}.category`}>
                        {relatedArticle.category}
                      </p>
                      <h3 className="mt-4 text-lg font-semibold text-brand-deep group-hover:text-brand-primary" data-content-path={`resourceArticles.${rIndex}.title`}>
                        {relatedArticle.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm text-slate-600" data-content-path={`resourceArticles.${rIndex}.summary`}>{relatedArticle.summary}</p>
                      <p className="mt-4 text-xs text-slate-400">Published <span data-content-path={`resourceArticles.${rIndex}.publishedOn`}>{relatedArticle.publishedOn}</span></p>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetailPage;
