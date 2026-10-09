import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getPublishedBlogBySlug, type BlogPost } from '../services/api';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollReveal(loading ? null : post);

  useEffect(() => {
    if (!slug) {
      setError('Article not specified.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getPublishedBlogBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setPost(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('This article could not be found or has not been published yet.');
          } else {
            setError('Unable to load article right now. Please try again later.');
          }
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
  }, [slug]);

  const dateStr = post
    ? post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date(post.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
    : '';

  return (
    <>
      <div
        className="breadcrumb-area bg-cover shadow dark text-center text-light"
        style={{ backgroundImage: 'url(/assets/img/shape/5.jpg)' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h1>{loading ? 'Article' : post ? post.title : 'Article Not Found'}</h1>
              <ul className="breadcrumb">
                <li>
                  <Link to="/">
                    <i className="fas fa-home" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>{loading ? '...' : post ? post.title.slice(0, 24) + '...' : 'Not Found'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-single-section default-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-12">
              <div className="blog-back-wrap mb-30">
                <Link to="/blog" className="btn-back-link">
                  <i className="fas fa-arrow-left" /> Back to Blog
                </Link>
              </div>

              {loading && (
                <div className="text-center py-5">
                  <p>Loading article...</p>
                </div>
              )}

              {error && !loading && (
                <div className="alert-error-box text-center py-5">
                  <h2>Article Unavailable</h2>
                  <p>{error}</p>
                  <Link to="/blog" className="btn btn-theme btn-md mt-30">
                    Browse All Articles
                  </Link>
                </div>
              )}

              {!loading && !error && post && (
                <article className="blog-single-card animate fadeInUp">
                  <header className="blog-single-header">
                    <h1 className="blog-single-title">{post.title}</h1>
                    <div className="blog-single-meta">
                      <span>
                        <i className="far fa-calendar-alt" /> {dateStr}
                      </span>
                      {post.author && (
                        <span>
                          <i className="far fa-user" /> {post.author}
                        </span>
                      )}
                    </div>
                  </header>

                  {post.featured_image && (
                    <div className="blog-single-thumb">
                      <img src={post.featured_image} alt={post.title} />
                    </div>
                  )}

                  {post.excerpt && (
                    <div className="blog-single-excerpt">
                      <p>{post.excerpt}</p>
                    </div>
                  )}

                  <div className="blog-single-body">
                    {post.content.split('\n\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;
                      return <p key={index}>{paragraph.trim()}</p>;
                    })}
                  </div>

                  <div className="blog-single-footer mt-30">
                    <Link to="/blog" className="btn btn-theme-outline btn-sm">
                      <i className="fas fa-arrow-left" /> Back to Blog
                    </Link>
                    <Link to="/booking" className="btn btn-theme btn-sm">
                      Book a Spa Appointment
                    </Link>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
