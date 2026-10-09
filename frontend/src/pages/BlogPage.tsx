import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getPublishedBlogs, type BlogPost } from '../services/api';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollReveal(loading ? null : posts);

  useEffect(() => {
    let isMounted = true;
    getPublishedBlogs()
      .then((data) => {
        if (isMounted) {
          setPosts(data || []);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load blog articles right now. Please try again later.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div
        className="breadcrumb-area bg-cover shadow dark text-center text-light"
        style={{ backgroundImage: 'url(/assets/img/shape/5.jpg)' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h1>Our Blog</h1>
              <ul className="breadcrumb">
                <li>
                  <Link to="/">
                    <i className="fas fa-home" /> Home
                  </Link>
                </li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-section default-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="site-heading text-center animate fadeInUp">
                <h4 className="sub-title">Spa & Wellness Tips</h4>
                <h2 className="title">Latest Articles & Insights</h2>
                <p>
                  Explore wellness guidance, home spa advice, and therapeutic bodywork insights crafted by our therapists.
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <p>Loading articles...</p>
            </div>
          )}

          {error && !loading && (
            <div className="alert-error-box text-center">
              <p>{error}</p>
              <button
                type="button"
                className="btn btn-theme btn-sm mt-30"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  getPublishedBlogs()
                    .then((data) => setPosts(data || []))
                    .catch(() => setError('Unable to load blog articles right now. Please try again later.'))
                    .finally(() => setLoading(false));
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="empty-state text-center py-5">
              <div className="empty-state-icon">
                <i className="fas fa-newspaper" style={{ fontSize: '3rem', color: 'var(--theme-soft)' }} />
              </div>
              <h3 className="mt-30">No Articles Published Yet</h3>
              <p>We are preparing new wellness tips and spa guides for you. Check back soon!</p>
              <Link to="/services" className="btn btn-theme btn-md mt-30">
                Explore Our Services
              </Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="row blog-grid">
              {posts.map((post, index) => {
                const dateStr = post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : new Date(post.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <div key={post.id} className="col-xl-4 col-lg-6 col-md-6 mt-30">
                    <article
                      className="blog-item-card animate fadeInUp"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {post.featured_image && (
                        <div className="blog-thumb">
                          <Link to={`/blog/${post.slug}`}>
                            <img src={post.featured_image} alt={post.title} loading="lazy" />
                          </Link>
                        </div>
                      )}
                      <div className="blog-item-content">
                        <div className="blog-meta">
                          <span>
                            <i className="far fa-calendar-alt" /> {dateStr}
                          </span>
                          {post.author && (
                            <span>
                              <i className="far fa-user" /> {post.author}
                            </span>
                          )}
                        </div>
                        <h3 className="blog-title">
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p className="blog-excerpt">
                          {post.excerpt || post.content.slice(0, 140) + '...'}
                        </p>
                        <Link to={`/blog/${post.slug}`} className="btn-read-more">
                          Read More <i className="fas fa-arrow-right" />
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
