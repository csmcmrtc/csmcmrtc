import { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  Eye,
  Reply,
  MoreVertical,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Download,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react';
import storeService from '../../services/storeService';
import reviewService, { type Review as ApiReview, type ReviewsResponse } from '../../services/reviewService';

interface Review {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    email: string;
    verified: boolean;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  date: string;
  verified: boolean;
  status: 'approved' | 'pending' | 'rejected';
  response?: {
    text: string;
    date: string;
    respondedBy: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  responseRate: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_storeId, setStoreId] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    responseRate: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Fetch reviews data
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the store ID
      const storeResponse = await storeService.getMyStore();
      const store = storeResponse?.data?.store;
      if (!store?.id) {
        throw new Error('Store not found');
      }
      setStoreId(store.id);

      // Fetch reviews for this store
      const response = await reviewService.getStoreReviews(store.id, {}) as ReviewsResponse;
      const reviewsData = response?.data?.reviews || [];
      const summary = response?.data?.summary;

      // Transform API data to component format
      const transformedReviews: Review[] = reviewsData.map((review: ApiReview) => ({
        id: review.id,
        customer: {
          name: review.user?.name || 'Anonymous',
          email: '',
          verified: review.is_verified_purchase || false
        },
        product: {
          id: review.product_id || '',
          name: review.product?.name || 'Unknown Product',
          image: review.product?.image_url || 'https://via.placeholder.com/50'
        },
        rating: review.rating || 0,
        title: review.title || '',
        comment: review.comment || '',
        images: [],
        helpful: 0,
        notHelpful: 0,
        date: review.created_at || new Date().toISOString(),
        verified: review.is_verified_purchase || false,
        status: review.is_visible ? 'approved' : 'pending' as 'approved' | 'pending' | 'rejected',
        response: undefined
      }));

      setReviews(transformedReviews);

      // Use summary from API if available, otherwise calculate
      if (summary) {
        const totalReviews = summary.total_reviews || transformedReviews.length;
        const pendingReviews = transformedReviews.filter(r => r.status === 'pending').length;
        const respondedReviews = transformedReviews.filter(r => r.response).length;
        const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

        setStats({
          totalReviews,
          averageRating: Math.round((summary.average_rating || 0) * 10) / 10,
          pendingReviews,
          responseRate: Math.round(responseRate),
          ratingDistribution: {
            5: summary.rating_breakdown?.[5] || 0,
            4: summary.rating_breakdown?.[4] || 0,
            3: summary.rating_breakdown?.[3] || 0,
            2: summary.rating_breakdown?.[2] || 0,
            1: summary.rating_breakdown?.[1] || 0
          }
        });
      } else {
        // Calculate stats from reviews
        const totalReviews = transformedReviews.length;
        const averageRating = totalReviews > 0 
          ? transformedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
          : 0;
        const pendingReviews = transformedReviews.filter(r => r.status === 'pending').length;
        const respondedReviews = transformedReviews.filter(r => r.response).length;
        const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        transformedReviews.forEach(r => {
          const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating]++;
          }
        });

        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingReviews,
          responseRate: Math.round(responseRate),
          ratingDistribution
        });
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getRatingPercentage = (count: number) => {
    return (count / stats.totalReviews) * 100;
  };

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

    const matchesStatus =
      statusFilter === 'all' || review.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const updateReviewStatus = (reviewId: string, newStatus: Review['status']) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
    setShowActionMenu(null);
  };

  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setShowResponseModal(true);
    setResponseText(review.response?.text || '');
  };

  const handleSubmitResponse = () => {
    if (!selectedReview || !responseText.trim()) return;

    setReviews(prev =>
      prev.map(review =>
        review.id === selectedReview.id
          ? {
              ...review,
              response: {
                text: responseText,
                date: new Date().toISOString(),
                respondedBy: 'Store Team'
              }
            }
          : review
      )
    );

    setShowResponseModal(false);
    setSelectedReview(null);
    setResponseText('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600">Manage and respond to customer feedback</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews}</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% this month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating}</h3>
                <div className="flex items-center">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +0.3 from last month
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingReviews}</h3>
              <p className="text-sm text-gray-500 mt-2">Requires action</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.responseRate}%</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5% this month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Reply className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${getRatingPercentage(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-12 text-right">
                {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <Filter className="h-4 w-4" />
              More Filters
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {/* Customer Avatar */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-semibold">
                  {review.customer.name.charAt(0)}
                </div>

                {/* Customer Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                    {review.customer.verified && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Award className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                  {getStatusIcon(review.status)}
                  <span className="ml-1 capitalize">{review.status}</span>
                </span>

                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === review.id ? null : review.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>

                  {showActionMenu === review.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                        Reject
                      </button>
                      <button
                        onClick={() => openReviewModal(review)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                        View Details
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-red-600">
                        <Flag className="h-4 w-4" />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={review.product.image}
                alt={review.product.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <p className="text-sm font-medium text-gray-700">{review.product.name}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              {renderStars(review.rating, 'h-5 w-5')}
              <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
            </div>

            {/* Review Title */}
            {review.title && (
              <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
            )}

            {/* Review Comment */}
            <p className="text-gray-700 mb-3">{review.comment}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="h-20 w-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}

            {/* Helpful Count */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 cursor-pointer">
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({review.helpful})</span>
                            <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 cursor-pointer"></button>
                <ThumbsDown className="h-4 w-4" />
                <span>Not Helpful ({review.notHelpful})</span>
              </button>
            </div>

            {/* Store Response */}
            {review.response ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Response from {review.response.respondedBy}
                    </span>
                  </div>
                  <span className="text-xs text-blue-700">
                    {new Date(review.response.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-blue-900">{review.response.text}</p>
                <button
                  onClick={() => openResponseModal(review)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 cursor-pointer"
                >
                  Edit Response
                </button>
              </div>
            ) : (
              <button
                onClick={() => openResponseModal(review)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer text-sm font-medium"
              >
                <Reply className="h-4 w-4" />
                Respond to Review
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">
            {searchTerm || ratingFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'You haven\'t received any reviews yet'}
          </p>
        </div>
      )}

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
              setSelectedReview(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-16 w-16 flex items-center justify-center text-white font-semibold text-xl">
                      {selectedReview.customer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{selectedReview.customer.name}</h4>
                        {selectedReview.customer.verified && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified Customer
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{selectedReview.customer.email}</p>
                      {selectedReview.verified && (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <Award className="h-4 w-4" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Product</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={selectedReview.product.image}
                    alt={selectedReview.product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedReview.product.name}</p>
                    <p className="text-sm text-gray-600">Product ID: {selectedReview.product.id}</p>
                  </div>
                </div>
              </div>

              {/* Review Details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Review</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating, 'h-5 w-5')}
                      <span className="text-lg font-semibold text-gray-900">{selectedReview.rating}.0</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedReview.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {selectedReview.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedReview.title}</h4>
                  )}

                  <p className="text-gray-700 mb-4">{selectedReview.comment}</p>

                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Attached Images</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedReview.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Engagement</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Helpful</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedReview.helpful}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <ThumbsDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Not Helpful</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedReview.notHelpful}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Response */}
              {selectedReview.response && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Your Response</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedReview.response.respondedBy}
                      </span>
                      <span className="text-xs text-blue-700">
                        {new Date(selectedReview.response.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-blue-900">{selectedReview.response.text}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Review Status</h3>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                    {getStatusIcon(selectedReview.status)}
                    <span className="ml-1 capitalize">{selectedReview.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateReviewStatus(selectedReview.id, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => updateReviewStatus(selectedReview.id, 'rejected')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  openResponseModal(selectedReview);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <Reply className="h-4 w-4" />
                {selectedReview.response ? 'Edit Response' : 'Add Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResponseModal(false);
              setSelectedReview(null);
              setResponseText('');
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedReview.response ? 'Edit Response' : 'Respond to Review'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Responding to {selectedReview.customer.name}'s review
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Original Review */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating, 'h-4 w-4')}
                  <span className="text-sm font-medium text-gray-700">{selectedReview.rating}.0</span>
                </div>
                {selectedReview.title && (
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">{selectedReview.title}</h4>
                )}
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              </div>

              {/* Response Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Write your response to this review..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {responseText.length} / 500 characters
                </p>
              </div>

              {/* Quick Response Templates */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setResponseText("Thank you for your wonderful feedback! We're thrilled you're enjoying your purchase.")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Positive Response
                  </button>
                  <button
                    onClick={() => setResponseText("Thank you for sharing your experience. We're sorry to hear about the issue. Please contact our support team so we can make this right.")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Issue Response
                  </button>
                  <button
                    onClick={() => setResponseText("We appreciate your feedback and will work on improving this aspect. Thank you for your valuable input!")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Neutral Response
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {selectedReview.response ? 'Update Response' : 'Post Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
            1
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            2
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            3
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;