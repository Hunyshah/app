/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */

/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import apiFunction from "@/components/apifunction/apiFunction";
import { conversationMessageApi, businessDataByIdApi } from "@/components/apifunction/ApiFile";
import LoginGate from "@/components/chat/LoginGate";
import { InlineSpinner } from "@/components/common/Spinner";
import { uploadMultipleFilesToVercel } from "@/components/apifunction/uploadFileVercel";
import UploadMenu from "@/components/chat/UploadMenu";
import { Plus } from "lucide-react";

function AttachmentList({ attachments }) {
  if (!attachments || !attachments.length) return null;
  const isImage = (t = "") => String(t).toLowerCase().startsWith("image/");
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {attachments.map((att, idx) => {
        const name = att?.name || att?.fileName || att?.originalName || "Attachment";
        const type = att?.fileType || att?.type || "";
        const url = att?.url || att?.fileUrl;
        if (!url) return null;
        return (
          <div key={idx} className="border border-brand-border rounded-md overflow-hidden bg-brand-bg/60">
            {isImage(type) ? (
              <a href={url} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={name} className="w-full h-28 object-cover" />
                <div className="px-2 py-1 text-[11px] text-brand-text truncate">{name}</div>
              </a>
            ) : (
              <a href={url} target="_blank" rel="noreferrer" className="block px-2 py-2 text-[12px] text-brand-text">
                <div className="truncate font-medium">{name}</div>
                <div className="text-[10px] opacity-60">{type || "file"}</div>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg?.type === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`${
          isUser
            ? "bg-brand-accent text-black"
            : "bg-brand-input text-brand-text border border-brand-border"
        } max-w-[75%] rounded-lg px-3 py-2 whitespace-pre-wrap break-words`}
      >
        {msg?.user?.name && isUser ? (
          <div className="text-xs opacity-80 mb-1">{msg.user.name}</div>
        ) : null}
        <div>{msg?.message}</div>
        {Array.isArray(msg?.attachments) && msg.attachments.length ? (
          <AttachmentList attachments={msg.attachments} />
        ) : null}
        <div className="text-[10px] opacity-50 mt-1">
          {new Date(msg?.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ item, active, onClick, disabled }) {
  const title = item?.firstMessage?.message || "Untitled chat";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 rounded-md mb-2 border transition ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${
        active
          ? "bg-brand-input border-brand-border text-brand-text"
          : "bg-brand-bg/40 border-brand-border text-brand-muted hover:bg-brand-bg/60"
      }`}
    >
      <div className="text-sm truncate">{title}</div>
      <div className="text-[10px] opacity-60">
        {item?.firstMessage?.createdAt
          ? new Date(item.firstMessage.createdAt).toLocaleString()
          : new Date(item?.createdAt || Date.now()).toLocaleString()}
      </div>
    </button>
  );
}

export default function ChatPage() {
  const { postData, getData, userData } = apiFunction();
  const isAuthenticated = !!userData?.user;
  const searchParams = useSearchParams();
  const businessDataId = searchParams.get("id");

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const scrollerRef = useRef(null);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingAtt, setUploadingAtt] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  // Conversation list state
  const [conversations, setConversations] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convCount, setConvCount] = useState({ totalPage: 0, currentPageSize: 10 });
  const [loadingConvs, setLoadingConvs] = useState(false);
  // Show spinner in the button only when user triggers manual load-more
  const [loadingConvsMore, setLoadingConvsMore] = useState(false);
  const textareaRef = useRef(null);
  const [limitReached, setLimitReached] = useState(false);

  // Small-screen detection for responsive behavior (matches Tailwind's lg breakpoint ~1024px)
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const update = () => {
      const small = window.innerWidth < 1024;
      setIsSmallScreen(small);
      setSidebarOpen(small && !conversationId);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [conversationId]);

  // Auto-close sidebar when selecting a conversation on small screens
  useEffect(() => {
    if (isSmallScreen && conversationId) setSidebarOpen(false);
  }, [conversationId, isSmallScreen]);

  // Fetch business data when ID is present
  useEffect(() => {
    if (businessDataId && userData?.token) {
      const fetchBusinessData = async () => {
        try {
          const res = await getData(`${businessDataByIdApi}/${businessDataId}`);
          if (res?.success) {
            setBusinessData(res.data);
          }
        } catch {
          toast.error("Failed to load business data");
        }
      };
      fetchBusinessData();
    } else {
      setBusinessData(null);
    }
  }, [businessDataId, userData?.token, getData]);

  // Messages pagination state
  const [msgPage, setMsgPage] = useState(1);
  const [msgCount, setMsgCount] = useState({ totalPage: 0, currentPageSize: 10 });
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations(1);
    } else {
      // Reset on logout
      setConversations([]);
      setMessages([]);
      setConversationId(null);
      setLimitReached(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchConversations = async (page = 1) => {
    setLoadingConvs(true);
    try {
      const res = await getData(`conversation?page=${page}`);
      if (!res?.success) {
        toast.error(res?.message || "Failed to fetch conversations");
        return;
      }
      setConvPage(page);
      setConvCount(res?.count || { totalPage: 0, currentPageSize: 10 });
      setConversations(page === 1 ? res?.data || [] : [...conversations, ...(res?.data || [])]);
    } catch (error) {
      toast.error(error?.message || "Error fetching conversations");
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (id, page = 1) => {
    setLoadingMsgs(true);
    try {
      const res = await getData(`conversation/${id}?page=${page}`);
      if (!res?.success) {
        toast.error(res?.message || "Failed to fetch messages");
        return;
      }
      setMsgPage(page);
      setMsgCount(res?.count || { totalPage: 0, currentPageSize: 10 });
      setMessages(page === 1 ? res?.data || [] : [...(res?.data || []), ...messages]);
    } catch (error) {
      toast.error(error?.message || "Error fetching messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const openConversation = async (id) => {
    setConversationId(id);
    setMessages([]);
    setMsgPage(1);
    // Close sidebar on mobile immediately when conversation is clicked
    if (isSmallScreen) {
      setSidebarOpen(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
    // Start loading messages - this will trigger the loading spinner
    await fetchMessages(id, 1);
  };

  const loadMoreConversations = async () => {
    if (convPage < (convCount?.totalPage || 0)) {
      setLoadingConvsMore(true);
      await fetchConversations(convPage + 1);
      setLoadingConvsMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!conversationId) return;
    fetchMessages(conversationId, msgPage + 1);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    const userCount = messages.filter((m) => m.type === "user").length;
    if (!isAuthenticated && userCount >= 10) {
      toast.error("Please login");
      setLimitReached(true);
      return;
    }

    setSending(true);
    setThinking(true);
    // Optimistic user message
    const localUserMsg = { type: "user", message: content, createdAt: new Date().toISOString(), attachments: pendingAttachments };
    setMessages((prev) => [...prev, localUserMsg]);
    setInput("");

    if (!isAuthenticated && userCount + 1 >= 10) {
      setLimitReached(true);
      toast.error("Please login");
    }

     try {
       // Include businessDataId if there's an ID in the URL
       const payload = conversationId
         ? { message: content, type: "user", conversationId, ...(businessDataId && { businessDataId }), uploadDocuments: pendingAttachments }
         : { message: content, type: "user", ...(businessDataId && { businessDataId }), uploadDocuments: pendingAttachments };

      const res = await postData(conversationMessageApi, payload);
      if (!res?.success) {
        toast.error(res?.message || "Failed to send message");
        return;
      }

      setConversationId(res?.conversationId || conversationId);

      // Append only the AI response to avoid duplicating the user message
      const aiMsg =
        Array.isArray(res?.messages) && res.messages.length
          ? res.messages.find((m) => m.type === "ai") || res.messages[res.messages.length - 1]
          : null;
      if (aiMsg) {
        setMessages((prev) => [...prev, aiMsg]);
      }

      // Clear pending attachments after successful send
      setPendingAttachments([]);

      if (!conversationId && isAuthenticated) {
        // Optimistically insert conversation preview at the top for instant update
        const userCreatedAt = (Array.isArray(res?.messages) ? res.messages.find((m) => m.type === "user")?.createdAt : null) || new Date().toISOString();
        const preview = { conversationId: res?.conversationId, firstMessage: { message: content, createdAt: userCreatedAt } };
        setConversations((prev) => {
          if (prev.some((c) => String(c.conversationId) === String(preview.conversationId))) return prev;
          return [preview, ...prev];
        });
        fetchConversations(1);
      }
    } catch (error) {
      toast.error(error?.message || "Send failed");
    } finally {
      setSending(false);
      setThinking(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setInput("");
    setPendingAttachments([]);
    setLimitReached(false);
    if (isSmallScreen) setSidebarOpen(true);
  };

  // UploadMenu will trigger its own hidden inputs; we just reuse the same handler

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      console.log("files selected now ......>>>>>>>>")
      setUploadingAtt(true);
      const results = await uploadMultipleFilesToVercel(files, userData?.token);
      const mapped = (results || []).map((r) => ({
        name: r?.fileName,
        url: r?.fileUrl || r?.url,
        fileType: r?.fileType,
        fileSize: r?.fileSize,
      })).filter((x) => x?.url && x?.fileType);
      if (!mapped.length) {
        toast.error("Upload failed or invalid files");
      } else {
        setPendingAttachments((prev) => [...prev, ...mapped]);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to upload files");
    } finally {
      setUploadingAtt(false);
      // reset input so selecting the same file triggers change again
      e.target.value = "";
    }
  };

  const removePendingAttachment = (idx) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4">
      <LoginGate />
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
        {/* Left: conversations list */}
        <div className={`bg-brand-sidebar border border-brand-border rounded-xl p-3 h-[75vh] overflow-y-auto hide-scrollbar ${isSmallScreen ? (sidebarOpen ? "" : "hidden") : ""}`}> 
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-brand-text text-sm">Chats</h2>
            <div className="flex items-center gap-2">
              {isSmallScreen ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="bg-brand-input text-brand-text border border-brand-border rounded-md px-2 py-1 text-xs hover:brightness-95"
                >
                  Close
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => { if (!isAuthenticated) { toast.error("Please login"); return; } handleNewChat(); }}
                aria-disabled={!isAuthenticated}
                className={`bg-brand-input text-brand-text border border-brand-border rounded-md px-2 py-1 text-xs ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"}`}
              >
                + New chat
              </button>
            </div>
          </div>
          {loadingConvs && conversations.length === 0 ? (
            <div className="text-brand-muted text-xs">Loading chats…</div>
          ) : null}
          {isAuthenticated
            ? conversations.map((c) => (
                <ConversationItem
                  key={c.conversationId}
                  item={c}
                  active={String(c.conversationId) === String(conversationId)}
                  onClick={() => openConversation(c.conversationId)}
                  disabled={loadingMsgs}
                />
              ))
            : null}
          <div className="mt-2">
            {isAuthenticated && convPage < (convCount?.totalPage || 0) ? (
              <button
                className={`mt-2 w-full px-3 py-2 rounded-md bg-brand-input text-brand-text border border-brand-border text-xs ${(loadingConvs || loadingConvsMore) ? "opacity-80 cursor-not-allowed" : "hover:brightness-95"}`}
                onClick={loadMoreConversations}
                disabled={loadingConvs || loadingConvsMore}
              >
                {loadingConvsMore ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <InlineSpinner sizeClass="w-4 h-4" colorClass="border-brand-text" />
                    Loading…
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            ) : isAuthenticated ? (
              <div className="text-center text-brand-muted text-[11px]">No more conversations</div>
            ) : null}
          </div>
        </div>

        {/* Right: chat area */}
        <div className={`w-full bg-brand-sidebar border border-brand-border rounded-2xl p-4 shadow-sm relative ${isSmallScreen && sidebarOpen ? "hidden" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-brand-text text-xl">Chat</h1>
            <div className="flex items-center gap-2">
              {isSmallScreen ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="bg-brand-input text-brand-text border border-brand-border rounded-md px-3 py-2 hover:brightness-95"
                >
                  Chats
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => { if (!isAuthenticated) { toast.error("Please login"); return; } handleNewChat(); setTimeout(() => textareaRef.current?.focus(), 0); }}
                aria-disabled={!isAuthenticated}
                className={`bg-brand-input text-brand-text border border-brand-border rounded-md px-3 py-2 ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"}`}
              >
                New Chat
              </button>
            </div>
          </div>

          {thinking && (
            <div className="absolute inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="flex items-center gap-3 bg-brand-input/90 text-brand-text border border-brand-border rounded-md px-4 py-3 text-sm shadow-md">
                <InlineSpinner sizeClass="w-8 h-8" colorClass="border-brand-accent" />
                Thinking…
              </span>
            </div>
          )}
          <div
            ref={scrollerRef}
            className="h-[60vh] overflow-y-auto bg-brand-bg/40 border border-brand-border rounded-xl p-3 mb-3"
          >
            {conversationId ? (
              <div className="mb-2 flex justify-center">
                {msgCount?.currentPageSize === 10 && msgPage < (msgCount?.totalPage || 0) ? (
                   <button
                     type="button"
                     onClick={loadMoreMessages}
                     disabled={loadingMsgs}
                     className={`px-3 py-1 rounded-md bg-brand-input text-brand-text border border-brand-border text-xs ${loadingMsgs ? "opacity-80 cursor-not-allowed" : "hover:brightness-95"}`}
                   >
                     {loadingMsgs ? (
                       <span className="inline-flex items-center gap-2">
                         <InlineSpinner sizeClass="w-4 h-4" colorClass="border-brand-text" />
                         Loading…
                       </span>
                     ) : (
                       "Load older messages"
                     )}
                   </button>
                 ) : null}
              </div>
            ) : null}

            {loadingMsgs && msgPage === 1 && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-brand-text">
                <InlineSpinner sizeClass="w-6 h-6" colorClass="border-brand-text" />
                <span className="ml-2 text-sm">Loading messages…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-brand-muted text-sm text-center mt-8">
                {conversationId ? "No messages in this conversation." : "Start a conversation by typing a message below."}
              </div>
            ) : (
              messages.map((m, idx) => <MessageBubble key={idx} msg={m} />)
            )}
          </div>

          {/* Limit notice for unauthenticated users */}
          {!isAuthenticated && limitReached ? (
            <div className="text-brand-muted text-xs mb-2">
              You’ve reached the 10-message limit. Please log in to continue.
            </div>
          ) : null}

          {/* Pending attachments preview */}
          {pendingAttachments.length ? (
            <div className="mb-2 border border-brand-border rounded-md p-2 bg-brand-bg/40">
              <div className="text-[12px] text-brand-text mb-2">Attachments to send</div>
              <div className="grid grid-cols-2 gap-2">
                {pendingAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 border border-brand-border rounded px-2 py-1 bg-brand-input">
                    <a href={att?.url} target="_blank" rel="noreferrer" className="truncate text-[12px] text-brand-text">
                      {att?.name || att?.fileName || "Attachment"}
                    </a>
                    <button
                      type="button"
                      onClick={() => removePendingAttachment(idx)}
                      className="text-[11px] px-2 py-0.5 rounded bg-red-500/80 text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex gap-2 items-end">
            <div className="relative flex flex-col gap-2">
              {/* Plus icon to open UploadMenu */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) { toast.error("Please login"); return; }
                  setUploadMenuOpen((v) => !v);
                }}
                disabled={!isAuthenticated || uploadingAtt}
                aria-label="Add attachments"
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-brand-accent text-white shadow-md ${!isAuthenticated || uploadingAtt ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-600"}`}
              >
                <Plus size={18} />
              </button>

              {/* Floating upload menu */}
              <UploadMenu
                isOpen={uploadMenuOpen}
                onClose={() => setUploadMenuOpen(false)}
                onImageChange={onFilesSelected}
                onFileChange={onFilesSelected}
              />
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={!isAuthenticated && limitReached ? "Please log in to continue…" : "Type a message…"}
              disabled={!isAuthenticated && limitReached}
              className="flex-1 bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand-border disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim() || (!isAuthenticated && limitReached)}
              className={`w-28 bg-brand-accent text-black rounded-md px-3 py-2 transition ${
                sending || (!isAuthenticated && limitReached) ? "opacity-80 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner className="mb-0" sizeClass="w-5 h-5" colorClass="border-black" />
                  Sending…
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}