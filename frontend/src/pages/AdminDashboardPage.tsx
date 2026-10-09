import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAuthToken,
  createBlogAdmin,
  deleteBlogAdmin,
  getAdminBookings,
  getAllBlogsAdmin,
  getDashboardStats,
  getServices,
  updateBlogAdmin,
  updateBookingStatus,
  type BlogPost,
  type BlogPostPayload,
  type BookingStatus,
  type Service,
} from '../services/api';

type DashboardStat = { label: string; value: number };
type BookingRow = {
  id: number;
  customer_name: string;
  phone: string;
  email: string;
  service_id: number;
  booking_date: string;
  booking_time: string;
  address: string;
  notes?: string | null;
  status: BookingStatus;
  created_at: string;
};

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

type BlogFormState = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: 'draft' | 'published';
};

const emptyBlogForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  status: 'draft',
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'blogs'>('bookings');

  // Bookings state
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogError, setBlogError] = useState('');
  const [blogSuccess, setBlogSuccess] = useState('');
  const [blogForm, setBlogForm] = useState<BlogFormState>(emptyBlogForm);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [submittingBlog, setSubmittingBlog] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState<number | null>(null);

  const serviceDetails = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

  const loadDashboard = useCallback(async () => {
    const [dashboard, bookingList, serviceList] = await Promise.all([
      getDashboardStats(),
      getAdminBookings(),
      getServices(),
    ]);

    setStats([
      { label: 'Total bookings', value: Number(dashboard.total_bookings) },
      { label: 'Pending', value: Number(dashboard.pending) },
      { label: 'Approved', value: Number(dashboard.confirmed) },
      { label: 'Completed', value: Number(dashboard.completed) },
      { label: 'Cancelled', value: Number(dashboard.cancelled) },
      { label: 'Contact enquiries', value: Number(dashboard.contact_enquiries) },
    ]);
    setBookings(bookingList || []);
    setServices(serviceList || []);
  }, []);

  const loadBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    setBlogError('');
    try {
      const list = await getAllBlogsAdmin();
      setBlogs(list || []);
    } catch {
      setBlogError('Unable to load blog articles.');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard()
      .catch(() => {
        setError('Unable to load dashboard data. Please log in again.');
        clearAuthToken();
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [loadDashboard, navigate]);

  useEffect(() => {
    if (activeTab === 'blogs') {
      loadBlogs();
    }
  }, [activeTab, loadBlogs]);

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  const handleStatusUpdate = async (bookingId: number, status: BookingStatus) => {
    setError('');
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      await loadDashboard();
    } catch {
      setError('Unable to update this appointment. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Blog management handlers
  const handleOpenNewBlogForm = () => {
    setBlogForm(emptyBlogForm);
    setIsEditingBlog(false);
    setBlogError('');
    setBlogSuccess('');
  };

  const handleEditBlog = (post: BlogPost) => {
    setBlogForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image: post.featured_image || '',
      status: post.status,
    });
    setIsEditingBlog(true);
    setBlogError('');
    setBlogSuccess('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelBlogEdit = () => {
    setBlogForm(emptyBlogForm);
    setIsEditingBlog(false);
    setBlogError('');
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      setBlogError('Title and article content are required.');
      return;
    }

    setSubmittingBlog(true);
    setBlogError('');
    setBlogSuccess('');

    const payload: BlogPostPayload = {
      title: blogForm.title.trim(),
      slug: blogForm.slug.trim() || undefined,
      excerpt: blogForm.excerpt.trim() || undefined,
      content: blogForm.content.trim(),
      featured_image: blogForm.featured_image.trim() || undefined,
      status: blogForm.status,
    };

    try {
      if (isEditingBlog && blogForm.id) {
        await updateBlogAdmin(blogForm.id, payload);
        setBlogSuccess('Article updated successfully.');
      } else {
        await createBlogAdmin(payload);
        setBlogSuccess('Article created successfully.');
      }
      setBlogForm(emptyBlogForm);
      setIsEditingBlog(false);
      await loadBlogs();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to save article. Please check fields and try again.';
      setBlogError(typeof errorMsg === 'string' ? errorMsg : 'Unable to save article.');
    } finally {
      setSubmittingBlog(false);
    }
  };

  const handleDeleteBlog = async (post: BlogPost) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingBlogId(post.id);
    setBlogError('');
    setBlogSuccess('');

    try {
      await deleteBlogAdmin(post.id);
      setBlogSuccess(`Article "${post.title}" deleted.`);
      if (blogForm.id === post.id) {
        setBlogForm(emptyBlogForm);
        setIsEditingBlog(false);
      }
      await loadBlogs();
    } catch {
      setBlogError('Unable to delete article. Please try again.');
    } finally {
      setDeletingBlogId(null);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const nextStatus: 'draft' | 'published' = post.status === 'published' ? 'draft' : 'published';
    setBlogError('');
    setBlogSuccess('');
    try {
      await updateBlogAdmin(post.id, { status: nextStatus });
      setBlogSuccess(`Article is now ${nextStatus}.`);
      await loadBlogs();
    } catch {
      setBlogError(`Unable to set article to ${nextStatus}.`);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage appointments and publish wellness blog articles.</p>
          </div>
          <button type="button" className="btn btn-theme btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs mt-30">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar-check" /> Appointments ({bookings.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <i className="fas fa-newspaper" /> Blog Articles ({blogs.length})
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            {error && <p className="auth-error" role="alert">{error}</p>}

            {loading ? (
              <p>Loading appointments...</p>
            ) : (
              <>
                <div className="stat-grid">
                  {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="admin-table-wrap">
                  <h3>Appointment requests</h3>
                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <p>No appointment requests yet.</p>
                    </div>
                  ) : (
                    <div className="booking-list">
                      {bookings.map((booking) => {
                        const service = serviceDetails.get(booking.service_id);
                        return (
                          <article key={booking.id} className="admin-booking-card">
                            <div className="admin-booking-main">
                              <div>
                                <div className="booking-heading">
                                  <h4>{booking.customer_name}</h4>
                                  <span className={`badge badge-${booking.status}`}>
                                    {statusLabels[booking.status]}
                                  </span>
                                </div>
                                <p className="booking-service">
                                  {service?.name || `Service #${booking.service_id}`}
                                </p>
                                {service && (
                                  <p>
                                    <strong>Service details:</strong> {service.duration_minutes} min · ₹
                                    {service.price.toLocaleString('en-IN')}
                                  </p>
                                )}
                                <p>
                                  <strong>Requested:</strong> {booking.booking_date} at{' '}
                                  {booking.booking_time.slice(0, 5)}
                                </p>
                                <p>
                                  <strong>Submitted:</strong>{' '}
                                  {new Date(booking.created_at).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Address:</strong> {booking.address}
                                </p>
                                {booking.notes && (
                                  <p>
                                    <strong>Notes:</strong> {booking.notes}
                                  </p>
                                )}
                              </div>
                              <div className="booking-contact">
                                <a href={`tel:${booking.phone}`}>
                                  <i className="fas fa-phone" /> {booking.phone}
                                </a>
                                <a href={`mailto:${booking.email}`}>
                                  <i className="fas fa-envelope" /> {booking.email}
                                </a>
                              </div>
                            </div>
                            <div className="booking-actions">
                              {booking.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn btn-theme btn-sm"
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                >
                                  Approve
                                </button>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  type="button"
                                  className="btn btn-complete btn-sm"
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                >
                                  Mark completed
                                </button>
                              )}
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <button
                                  type="button"
                                  className="btn btn-cancel btn-sm"
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                >
                                  Decline
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Blog Management Tab */}
        {activeTab === 'blogs' && (
          <div className="admin-blog-manager mt-30">
            {blogError && <p className="auth-error" role="alert">{blogError}</p>}
            {blogSuccess && <p className="booking-success" role="status">{blogSuccess}</p>}

            {/* Create/Edit Form */}
            <div className="admin-blog-form-card mb-80">
              <div className="admin-blog-form-header">
                <h3>{isEditingBlog ? `Edit Article: ${blogForm.title}` : 'Add New Blog Article'}</h3>
                {isEditingBlog && (
                  <button type="button" className="btn btn-cancel btn-sm" onClick={handleCancelBlogEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleBlogSubmit} className="blog-form mt-30">
                <div className="form-group">
                  <label htmlFor="blog-title">
                    <strong>Title *</strong>
                  </label>
                  <input
                    id="blog-title"
                    type="text"
                    required
                    placeholder="e.g. 5 Benefits of Swedish Massage for Back Pain"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-slug">
                    <strong>URL Slug (optional)</strong>
                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>
                      Leave blank to auto-generate from title.
                    </span>
                  </label>
                  <input
                    id="blog-slug"
                    type="text"
                    placeholder="e.g. 5-benefits-of-swedish-massage"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-excerpt">
                    <strong>Short Description / Excerpt</strong>
                  </label>
                  <textarea
                    id="blog-excerpt"
                    rows={2}
                    placeholder="Brief 1-2 sentence preview for the blog listing page"
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-content">
                    <strong>Article Content *</strong>
                  </label>
                  <textarea
                    id="blog-content"
                    rows={8}
                    required
                    placeholder="Write your article text here. Separate paragraphs with double enter."
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-image">
                    <strong>Featured Image URL (optional)</strong>
                  </label>
                  <input
                    id="blog-image"
                    type="url"
                    placeholder="https://example.com/image.jpg or /assets/img/menu/swedish.jpg"
                    value={blogForm.featured_image}
                    onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="blog-status">
                    <strong>Status</strong>
                  </label>
                  <select
                    id="blog-status"
                    value={blogForm.status}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' })
                    }
                  >
                    <option value="draft">Draft (Hidden from public)</option>
                    <option value="published">Published (Live on website)</option>
                  </select>
                </div>

                <div className="form-actions mt-30">
                  <button type="submit" className="btn btn-theme btn-md" disabled={submittingBlog}>
                    {submittingBlog
                      ? 'Saving...'
                      : isEditingBlog
                      ? 'Update Article'
                      : blogForm.status === 'published'
                      ? 'Publish Article'
                      : 'Save as Draft'}
                  </button>
                  {isEditingBlog && (
                    <button
                      type="button"
                      className="btn btn-cancel btn-md ml-15"
                      onClick={handleCancelBlogEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Articles Table / Cards */}
            <div className="admin-table-wrap">
              <div className="admin-header-row mb-30">
                <h3>Existing Articles</h3>
                <button
                  type="button"
                  className="btn btn-theme-outline btn-sm"
                  onClick={handleOpenNewBlogForm}
                >
                  + Add New Article
                </button>
              </div>

              {loadingBlogs ? (
                <p>Loading articles...</p>
              ) : blogs.length === 0 ? (
                <div className="empty-state">
                  <p>No blog articles yet. Use the form above to write your first article!</p>
                </div>
              ) : (
                <div className="admin-blog-list">
                  {blogs.map((post) => (
                    <article key={post.id} className="admin-blog-item-card">
                      <div className="admin-blog-item-info">
                        <div className="admin-blog-item-title-row">
                          <h4>{post.title}</h4>
                          <span
                            className={`badge ${
                              post.status === 'published' ? 'badge-confirmed' : 'badge-pending'
                            }`}
                          >
                            {post.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="admin-blog-meta">
                          <span>
                            <strong>Slug:</strong> /blog/{post.slug}
                          </span>{' '}
                          ·{' '}
                          <span>
                            <strong>Created:</strong>{' '}
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>{' '}
                          ·{' '}
                          <span>
                            <strong>Author:</strong> {post.author}
                          </span>
                        </p>
                        {post.excerpt && <p className="admin-blog-snippet">{post.excerpt}</p>}
                      </div>

                      <div className="admin-blog-item-actions">
                        {post.status === 'published' ? (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-theme-outline btn-sm"
                            title="View live article"
                          >
                            View Live
                          </a>
                        ) : null}

                        <button
                          type="button"
                          className="btn btn-theme btn-sm"
                          onClick={() => handleEditBlog(post)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            post.status === 'published' ? 'btn-cancel' : 'btn-complete'
                          }`}
                          onClick={() => handleTogglePublish(post)}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          type="button"
                          className="btn btn-cancel btn-sm"
                          disabled={deletingBlogId === post.id}
                          onClick={() => handleDeleteBlog(post)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
