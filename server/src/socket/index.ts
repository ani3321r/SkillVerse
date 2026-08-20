import { Server, Socket } from "socket.io";
import { pool } from "../config/database";

// ============================================
// REGISTER ALL SOCKET.IO EVENTS
// Call this once from index.ts after creating
// the Socket.IO server instance.
// ============================================

export function registerSocketHandlers(io: Server): void {

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    // ==========================================
    // JOIN USER ROOM
    // Each connected client joins a personal
    // room so we can send targeted messages.
    // ==========================================

    socket.on("join-user", (userId: number) => {
      if (!userId) return;

      const room = `user-${userId}`;
      socket.join(room);
      console.log(`User ${userId} joined ${room}`);
    });


    // ==========================================
    // JOIN CONVERSATION ROOM
    // Verify DB membership before allowing join.
    // ==========================================

    socket.on("join-conversation", async (data) => {
      try {
        const { conversationId, userId } = data;

        if (!conversationId || !userId) return;

        const member = await pool.query(
          `
          SELECT id
          FROM conversation_members
          WHERE conversation_id = $1
            AND user_id = $2
          LIMIT 1
          `,
          [conversationId, userId]
        );

        if (member.rows.length === 0) {
          console.log(
            `User ${userId} attempted to join unauthorized conversation ${conversationId}`
          );
          return;
        }

        const room = `conversation-${conversationId}`;
        socket.join(room);
        console.log(`User ${userId} joined ${room}`);

      } catch (error) {
        console.error("join-conversation error:", error);
      }
    });


    // ==========================================
    // SEND MESSAGE
    // Verify membership, save to DB, broadcast.
    // ==========================================

    socket.on("send-message", async (data) => {
      try {
        const { conversationId, senderId, message } = data;

        if (!conversationId || !senderId || !message?.trim()) return;

        // Verify sender is a member
        const member = await pool.query(
          `
          SELECT id
          FROM conversation_members
          WHERE conversation_id = $1
            AND user_id = $2
          LIMIT 1
          `,
          [conversationId, senderId]
        );

        if (member.rows.length === 0) {
          console.log("Unauthorized message attempt by socket:", socket.id);
          return;
        }

        // Save to database
        const result = await pool.query(
          `
          INSERT INTO messages (conversation_id, sender_id, message)
          VALUES ($1, $2, $3)
          RETURNING id, conversation_id, sender_id, message, created_at
          `,
          [conversationId, senderId, message.trim()]
        );

        const savedMessage = result.rows[0];

        // Touch conversation updated_at
        await pool.query(
          `UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [conversationId]
        );

        // Broadcast to everyone in the conversation room
        io
          .to(`conversation-${conversationId}`)
          .emit("new-message", savedMessage);

      } catch (error) {
        console.error("send-message error:", error);
      }
    });


    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });
}
