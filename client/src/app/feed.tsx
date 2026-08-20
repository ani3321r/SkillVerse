import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

const API_URL = "http://localhost:5000";

// Change this later when real authentication state is added.
const CURRENT_USER_ID = 1;

type Post = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;

  user_id: number;
  user_name: string;
  user_email: string;
  college: string;
  department: string;
  avatar_url: string | null;

  like_count: number;
  comment_count: number;
};

type Comment = {
  id: number;
  comment: string;
  created_at: string;
  user_id: number;
  user_name: string;
  avatar_url: string | null;
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);

  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [comments, setComments] = useState<
    Record<number, Comment[]>
  >({});

  const [commentText, setCommentText] = useState<
    Record<number, string>
  >({});

  const [commentLoading, setCommentLoading] = useState<number | null>(
    null
  );

  // ============================================
  // LOAD FEED
  // ============================================

  const loadFeed = async () => {
    try {
      const response = await fetch(`${API_URL}/api/feed`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load feed");
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error("LOAD FEED ERROR:", error);

      Alert.alert(
        "Feed Error",
        "Could not load the feed."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  // ============================================
  // REFRESH
  // ============================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  // ============================================
  // CREATE POST
  // ============================================

  const createPost = async () => {
    const content = postText.trim();

    if (!content) {
      Alert.alert(
        "Empty post",
        "Please write something before posting."
      );
      return;
    }

    try {
      setPosting(true);

      const response = await fetch(
        `${API_URL}/api/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create post"
        );
      }

      setPostText("");

      await loadFeed();
    } catch (error) {
      console.error("CREATE POST ERROR:", error);

      Alert.alert(
        "Post Failed",
        error instanceof Error
          ? error.message
          : "Could not create post."
      );
    } finally {
      setPosting(false);
    }
  };

  // ============================================
  // LIKE / UNLIKE
  // ============================================

  const toggleLike = async (post: Post) => {
    try {
      const response = await fetch(
        `${API_URL}/api/feed/${post.id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to like post"
        );
      }

      if (data.liked) {
        setLikedPosts((previous) => [
          ...previous,
          post.id,
        ]);
      } else {
        setLikedPosts((previous) =>
          previous.filter(
            (id) => id !== post.id
          )
        );
      }

      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? {
                ...item,
                like_count:
                  item.like_count +
                  (data.liked ? 1 : -1),
              }
            : item
        )
      );
    } catch (error) {
      console.error("LIKE ERROR:", error);

      Alert.alert(
        "Error",
        "Could not update like."
      );
    }
  };

  // ============================================
  // LOAD COMMENTS
  // ============================================

  const loadComments = async (postId: number) => {
    try {
      setCommentLoading(postId);

      const response = await fetch(
        `${API_URL}/api/feed/${postId}/comments`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load comments"
        );
      }

      setComments((previous) => ({
        ...previous,
        [postId]: data.comments || [],
      }));
    } catch (error) {
      console.error(
        "LOAD COMMENTS ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Could not load comments."
      );
    } finally {
      setCommentLoading(null);
    }
  };

  // ============================================
  // TOGGLE COMMENTS
  // ============================================

  const toggleComments = async (postId: number) => {
    const isExpanded =
      expandedComments.includes(postId);

    if (isExpanded) {
      setExpandedComments((previous) =>
        previous.filter(
          (id) => id !== postId
        )
      );

      return;
    }

    setExpandedComments((previous) => [
      ...previous,
      postId,
    ]);

    await loadComments(postId);
  };

  // ============================================
  // ADD COMMENT
  // ============================================

  const addComment = async (postId: number) => {
    const text =
      commentText[postId]?.trim() || "";

    if (!text) {
      return;
    }

    try {
      setCommentLoading(postId);

      const response = await fetch(
        `${API_URL}/api/feed/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            comment: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add comment"
        );
      }

      setCommentText((previous) => ({
        ...previous,
        [postId]: "",
      }));

      await loadComments(postId);

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                comment_count:
                  post.comment_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error(
        "ADD COMMENT ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Could not add comment."
      );
    } finally {
      setCommentLoading(null);
    }
  };

  // ============================================
  // DELETE POST
  // ============================================

  const deletePost = (postId: number) => {
    Alert.alert(
      "Delete post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/api/feed/${postId}?userId=${CURRENT_USER_ID}`,
                {
                  method: "DELETE",
                }
              );

              const data =
                await response.json();

              if (
                !response.ok ||
                !data.success
              ) {
                throw new Error(
                  data.message ||
                    "Failed to delete post"
                );
              }

              setPosts((previous) =>
                previous.filter(
                  (post) =>
                    post.id !== postId
                )
              );
            } catch (error) {
              console.error(
                "DELETE POST ERROR:",
                error
              );

              Alert.alert(
                "Error",
                "Could not delete post."
              );
            }
          },
        },
      ]
    );
  };

  // ============================================
  // TIME FORMAT
  // ============================================

  const formatDate = (date: string) => {
    const created = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - created.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };

  // ============================================
  // AVATAR
  // ============================================

  const getInitial = (name: string) => {
    return (
      name?.trim()?.charAt(0)?.toUpperCase() ||
      "S"
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading SkillVerse Feed...
        </Text>
      </View>
    );
  }

  // ============================================
  // UI
  // ============================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            SkillVerse
          </Text>

          <Text style={styles.headerSubtitle}>
            Student Community
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshIcon}>
            ↻
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* CREATE POST */}

        <View style={styles.createCard}>
          <View style={styles.createHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                S
              </Text>
            </View>

            <Text style={styles.createTitle}>
              What's happening?
            </Text>
          </View>

          <TextInput
            value={postText}
            onChangeText={setPostText}
            placeholder="Share your learning journey, project, achievement..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            style={styles.postInput}
          />

          <View style={styles.createFooter}>
            <Text style={styles.characterCount}>
              {postText.length} characters
            </Text>

            <Pressable
              style={[
                styles.postButton,
                (!postText.trim() ||
                  posting) &&
                  styles.postButtonDisabled,
              ]}
              onPress={createPost}
              disabled={
                !postText.trim() || posting
              }
            >
              {posting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.postButtonText}>
                  Post
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* FEED */}

        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            Community Feed
          </Text>

          <Text style={styles.feedCount}>
            {posts.length}{" "}
            {posts.length === 1
              ? "post"
              : "posts"}
          </Text>
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ✨
            </Text>

            <Text style={styles.emptyTitle}>
              No posts yet
            </Text>

            <Text style={styles.emptyText}>
              Be the first student to share
              something with the community.
            </Text>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked =
              likedPosts.includes(post.id);

            const isCommentsExpanded =
              expandedComments.includes(
                post.id
              );

            const postComments =
              comments[post.id] || [];

            return (
              <View
                key={post.id}
                style={styles.postCard}
              >
                {/* POST HEADER */}

                <View
                  style={styles.postHeader}
                >
                  <View
                    style={styles.postUser}
                  >
                    {post.avatar_url ? (
                      <View
                        style={styles.avatar}
                      >
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {getInitial(
                            post.user_name
                          )}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={styles.avatar}
                      >
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {getInitial(
                            post.user_name
                          )}
                        </Text>
                      </View>
                    )}

                    <View
                      style={
                        styles.userInfo
                      }
                    >
                      <Pressable
                        onPress={() =>
                          router.push(
                            `/student-profile?id=${post.user_id}`
                          )
                        }
                      >
                        <Text
                          style={
                            styles.userName
                          }
                        >
                          {post.user_name}
                        </Text>
                      </Pressable>

                      <Text
                        style={
                          styles.userDetails
                        }
                      >
                        {post.college}
                      </Text>

                      <Text
                        style={
                          styles.postTime
                        }
                      >
                        {formatDate(
                          post.created_at
                        )}
                      </Text>
                    </View>
                  </View>

                  {post.user_id ===
                    CURRENT_USER_ID && (
                    <Pressable
                      onPress={() =>
                        deletePost(
                          post.id
                        )
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        •••
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* CONTENT */}

                <Text
                  style={styles.postContent}
                >
                  {post.content}
                </Text>

                {/* ACTIONS */}

                <View
                  style={styles.actionRow}
                >
                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      toggleLike(post)
                    }
                  >
                    <Text
                      style={[
                        styles.actionIcon,
                        isLiked &&
                          styles.likedIcon,
                      ]}
                    >
                      {isLiked
                        ? "♥"
                        : "♡"}
                    </Text>

                    <Text
                      style={[
                        styles.actionText,
                        isLiked &&
                          styles.likedText,
                      ]}
                    >
                      {post.like_count}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      toggleComments(
                        post.id
                      )
                    }
                  >
                    <Text
                      style={styles.actionIcon}
                    >
                      💬
                    </Text>

                    <Text
                      style={styles.actionText}
                    >
                      {post.comment_count}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionButton}
                  >
                    <Text
                      style={styles.actionIcon}
                    >
                      ↗
                    </Text>

                    <Text
                      style={styles.actionText}
                    >
                      Share
                    </Text>
                  </Pressable>
                </View>

                {/* COMMENTS */}

                {isCommentsExpanded && (
                  <View
                    style={
                      styles.commentsSection
                    }
                  >
                    <View
                      style={
                        styles.commentInputRow
                      }
                    >
                      <TextInput
                        value={
                          commentText[
                            post.id
                          ] || ""
                        }
                        onChangeText={(text) =>
                          setCommentText(
                            (previous) => ({
                              ...previous,
                              [post.id]:
                                text,
                            })
                          )
                        }
                        placeholder="Write a comment..."
                        placeholderTextColor="#94A3B8"
                        style={
                          styles.commentInput
                        }
                      />

                      <Pressable
                        style={
                          styles.commentSendButton
                        }
                        onPress={() =>
                          addComment(
                            post.id
                          )
                        }
                        disabled={
                          commentLoading ===
                          post.id
                        }
                      >
                        {commentLoading ===
                        post.id ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <Text
                            style={
                              styles.commentSendText
                            }
                          >
                            →
                          </Text>
                        )}
                      </Pressable>
                    </View>

                    {postComments.length ===
                    0 ? (
                      <Text
                        style={
                          styles.noComments
                        }
                      >
                        No comments yet. Be the
                        first!
                      </Text>
                    ) : (
                      postComments.map(
                        (comment) => (
                          <View
                            key={
                              comment.id
                            }
                            style={
                              styles.comment
                            }
                          >
                            <View
                              style={
                                styles.smallAvatar
                              }
                            >
                              <Text
                                style={
                                  styles.smallAvatarText
                                }
                              >
                                {getInitial(
                                  comment.user_name
                                )}
                              </Text>
                            </View>

                            <View
                              style={
                                styles.commentBody
                              }
                            >
                              <Text
                                style={
                                  styles.commentUser
                                }
                              >
                                {
                                  comment.user_name
                                }
                              </Text>

                              <Text
                                style={
                                  styles.commentText
                                }
                              >
                                {
                                  comment.comment
                                }
                              </Text>
                            </View>
                          </View>
                        )
                      )
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },

  header: {
    height: 76,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  refreshIcon: {
    fontSize: 24,
    color: "#2563EB",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 60,
  },

  createCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  createHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  createTitle: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  postInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F8FAFC",
  },

  createFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  characterCount: {
    fontSize: 11,
    color: "#94A3B8",
  },

  postButton: {
    minWidth: 90,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  postButtonDisabled: {
    opacity: 0.45,
  },

  postButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  feedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  feedCount: {
    fontSize: 12,
    color: "#64748B",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 40,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 8,
    maxWidth: 400,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  postUser: {
    flexDirection: "row",
    flex: 1,
  },

  userInfo: {
    marginLeft: 11,
    flex: 1,
  },

  userName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  userDetails: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },

  postTime: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  deleteButton: {
    padding: 8,
  },

  deleteText: {
    fontSize: 16,
    color: "#64748B",
  },

  postContent: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
  },

  actionRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25,
  },

  actionIcon: {
    fontSize: 19,
    color: "#64748B",
  },

  likedIcon: {
    color: "#EF4444",
  },

  actionText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  likedText: {
    color: "#EF4444",
  },

  commentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  commentInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#F8FAFC",
  },

  commentSendButton: {
    width: 42,
    height: 42,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  commentSendText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  noComments: {
    marginTop: 15,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },

  comment: {
    marginTop: 14,
    flexDirection: "row",
  },

  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  smallAvatarText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  },

  commentBody: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
  },

  commentUser: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  commentText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  bottomSpace: {
    height: 30,
  },
});