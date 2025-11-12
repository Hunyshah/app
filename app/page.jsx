/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable no-console */
/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "@/components/Redux/Slices/AuthSlice";
import {
  AiOutlineClose,
  AiOutlineDown,
  AiOutlineFile,
  AiOutlinePlus,
} from "react-icons/ai";
import { CgMenuLeft } from "react-icons/cg";
import { RiSendPlane2Line } from "react-icons/ri";
import UploadMenu from "@/components/chat/UploadMenu";
import { useRouter, useSearchParams } from "next/navigation";
import apiFunction from "@/components/apifunction/apiFunction";
import { conversationMessageApi } from "@/components/apifunction/ApiFile";
import { InlineSpinner } from "@/components/common/Spinner";

export default function Page() {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLarge, setIsLarge] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const { userData, getData, postData } = apiFunction();
  // Persist temporary anonymous chats locally so attachments survive refresh
  const ANON_MESSAGES_KEY = "anon_chat_messages_v1";
  
  // Extract parameters from URL
  const searchParams = useSearchParams();
  const businessDataId = searchParams.get("id");
  const conversationIdFromURL = searchParams.get("cid");


  // Conversation state
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convCount, setConvCount] = useState({
    totalPage: 0,
    currentPageSize: 10,
  });
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [msgCount, setMsgCount] = useState({
    totalPage: 0,
    currentPageSize: 10,
  });
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [thinking, setThinking] = useState(false);
  // Show spinner in the button only when user triggers manual load-more
  const [loadingConvsMore, setLoadingConvsMore] = useState(false);
  // Unauthenticated temporary chat limit
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    // Auto open on large screens (>=1024px), auto close on small screens (<1024px)
    const update = () => {
      const large =
        typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
      setIsLarge(large);
      setSidebarOpen(large);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Load anonymous messages from localStorage on mount or when logged-out
  useEffect(() => {
    if (!userData?.token) {
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(ANON_MESSAGES_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setMessages(parsed);
        }
      } catch (e) {
        console.warn("Failed to read anonymous messages from localStorage", e);
      }
    } else {
      // Clear anon cache when user is authenticated
      try { localStorage.removeItem(ANON_MESSAGES_KEY); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.token]);

  // Save anonymous messages to localStorage when they change
  useEffect(() => {
    if (!userData?.token) {
      try {
        localStorage.setItem(ANON_MESSAGES_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn("Failed to save anonymous messages to localStorage", e);
      }
    }
  }, [messages, userData?.token]);

  // Load conversations when authenticated
  useEffect(() => {
    if (userData?.token) fetchConversations(1);
  }, [userData?.token]);

  // Auto-open conversation if cid is in URL
  useEffect(() => {
    if (conversationIdFromURL && userData?.token && conversations.length > 0) {
      const conversationExists = conversations.find(c => String(c.conversationId) === String(conversationIdFromURL));
      if (conversationExists && String(conversationId) !== String(conversationIdFromURL)) {
        openConversation(conversationIdFromURL);
      }
    }
  }, [conversationIdFromURL, userData?.token, conversations]);

  const fetchConversations = async (page = 1) => {
    try {
      setLoadingConvs(true);
      const res = await getData(`conversation?page=${page}`);
      if (res?.success) {
        setConvPage(page);
        setConvCount(res?.count || { totalPage: 0, currentPageSize: 10 });
        setConversations(
          page === 1
            ? res?.data || []
            : [...conversations, ...(res?.data || [])]
        );
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (id, page = 1) => {
    try {
      setLoadingMsgs(true);
      const res = await getData(`conversation/${id}?page=${page}`);
      if (res?.success) {
        setMsgPage(page);
        setMsgCount(res?.count || { totalPage: 0, currentPageSize: 10 });
        const newMsgs = page === 1 ? (res?.data || []) : ([...(res?.data || []), ...messages]);
        setMessages(newMsgs);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const openConversation = async (id) => {
    setConversationId(id);
    setMessages([]);
    setMsgPage(1);
    // Close sidebar on mobile immediately when conversation is clicked
    if (!isLarge) {
      setSidebarOpen(false);
    }
    
    // Find the conversation to get businessDataId
    const conversation = conversations.find(c => String(c.conversationId) === String(id));
    const conversationBusinessDataId = conversation?.businessDataId;
    
    // Navigate with both parameters if businessDataId exists, otherwise just cid
    const urlParams = new URLSearchParams();
    urlParams.set('cid', id);
    if (conversationBusinessDataId) {
      urlParams.set('id', conversationBusinessDataId);
    }
    
    // Update URL without page reload
    const newUrl = `/?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    
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

  const handleNewChat = () => {
    if (userData?.user) {
      setConversationId(null);
      setMessages([]);
      setInput("");
      setLimitReached(false);
      // Clear anonymous cache if present
      if (!userData?.token) {
        try { localStorage.removeItem(ANON_MESSAGES_KEY); } catch {}
      }
      // On small screens, close the sidebar and focus the input
      if (!isLarge && sidebarOpen) {
        setSidebarOpen(false);
      }
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      toast.error("Please log in to continue. ");
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content && attachments.length === 0) return;
    
    // Enforce 10-message cap for unauthenticated users
    const userCount = messages.filter(
      (m) => (m.role || m.type) === "user"
    ).length;
    if (!userData?.token && userCount >= 10) {
      toast.error("Please login to continue");
      setLimitReached(true);
      return;
    }
    
    // Optimistic user message and thinking message
    setThinking(true);
    // Only include attachments that have a real, public URL and type
    const validLocalAttachments = attachments.filter(att => (att.url || att.fileUrl) && (att.fileType || att.originalFile?.type));
    const localUserMsg = {
      type: "user",
      message: content || (validLocalAttachments.length > 0 ? `Uploaded ${validLocalAttachments.length} file(s)` : ""),
      attachments: validLocalAttachments.length > 0 ? validLocalAttachments.map(att => ({
        name: att.fileName || att.originalFile?.name,
        type: att.fileType || att.originalFile?.type,
        url: att.url || att.fileUrl,
        size: att.fileSize || att.originalFile?.size
      })) : undefined,
      createdAt: new Date().toISOString(),
    };
    
    // Add thinking message
    const thinkingMsg = {
      type: "assistant",
      message: "Analyzing your files and message...",
      isThinking: true,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, localUserMsg, thinkingMsg]);
    setInput("");
    const currentAttachments = attachments.slice();
    // Clear bottom previews immediately after sending
    setAttachments([]);
    
    if (!userData?.token && userCount + 1 >= 10) {
      setLimitReached(true);
      toast.error("Please login to continue");
    }
    
    try {
      // Use conversationId from URL (cid) if available, otherwise use state
      const activeConversationId = conversationIdFromURL || conversationId;
      
      // Prepare upload documents for the API (only current message attachments)
      const sourceAttachments = (typeof currentAttachments !== 'undefined' ? currentAttachments : attachments);
      const filtered = Array.isArray(sourceAttachments)
        ? sourceAttachments.filter(att => (att.url || att.fileUrl) && (att.fileType || att.originalFile?.type))
        : [];
      const uploadDocuments = filtered.length > 0 ? filtered.map(att => ({
        name: att.fileName || att.originalFile?.name,
        url: ((att.url || att.fileUrl || '') + '').trim(),
        fileType: att.fileType || att.originalFile?.type,
        fileSize: att.fileSize || att.originalFile?.size
      })) : undefined;
      
      // Include businessDataId if there's an ID in the URL
      const payload = activeConversationId
        ? { 
            message: content || "Please analyze the uploaded files", 
            type: "user", 
            conversationId: activeConversationId, 
            ...(businessDataId && { businessDataId }),
            ...(uploadDocuments && { uploadDocuments })
          }
        : { 
            message: content || "Please analyze the uploaded files", 
            type: "user", 
            ...(businessDataId && { businessDataId }),
            ...(uploadDocuments && { uploadDocuments })
          };
      
      const res = await postData(conversationMessageApi, payload);
      if (!res?.success) return;
      
      setConversationId(res?.conversationId || conversationId);
      
      // Append only AI response to avoid duplicating user message
      const aiMsg =
        Array.isArray(res?.messages) && res.messages.length
          ? res.messages.find((m) => m.type === "ai") ||
            res.messages[res.messages.length - 1]
          : null;
      
      if (aiMsg) {
        // Replace the thinking message with the actual AI response
        setMessages((prev) => {
          const newMessages = [...prev];
          const thinkingIndex = newMessages.findIndex(msg => msg.isThinking);
          if (thinkingIndex !== -1) {
            newMessages[thinkingIndex] = aiMsg;
          }
          return newMessages;
        });
      }
      
      
      if (!activeConversationId && userData?.token) {
        const userCreatedAt =
          (Array.isArray(res?.messages)
            ? res.messages.find((m) => m.type === "user")?.createdAt
            : null) || new Date().toISOString();
        const preview = {
          conversationId: res?.conversationId,
          firstMessage: { message: content || "File upload", createdAt: userCreatedAt },
          ...(businessDataId && { businessDataId }),
        };
        setConversations((prev) => {
          if (
            prev.some(
              (c) => String(c.conversationId) === String(preview.conversationId)
            )
          )
            return prev;
          return [preview, ...prev];
        });
        fetchConversations(1);
      }
    } catch (err) {
      console.error("Failed to send", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setThinking(false);
    }
  };

  const handleFiles = async (e) => {

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
  
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExt = ["png", "jpg", "jpeg", "svg", "webp", "pdf", "doc", "docx", "xls", "xlsx", "txt"];
  
    const validFiles = [];
    const placeholders = [];
  
    for (const file of files) {
      const name = file.name || "";
      const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  
      if (!allowedExt.includes(ext)) {
        toast.error(`Unsupported file: ${name}. Allowed: PNG, JPG, XLSX, TXT`);
        continue;
      }
  
      if (file.size > maxSize) {
        toast.error(`File too large: ${name}. Maximum size is 10MB`);
        continue;
      }
  
      const isImage = ["png", "jpg", "jpeg", "svg", "webp"].includes(ext);
      const objectUrl = isImage ? URL.createObjectURL(file) : null;
  
      placeholders.push({
        originalFile: file,
        fileName: name,
        fileType: file.type,
        fileSize: file.size,
        url: null,
        previewUrl: objectUrl,
        objectUrl,
        isUploading: true,
        ext,
      });
  
      validFiles.push(file);
    }
  
    if (validFiles.length === 0) return;
  
    // Show dummy previews immediately
    setAttachments((prev) => [...prev, ...placeholders]);
  
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        console.log("<<<<<<<<<< try to access file in there <><><><><><><>")
  
        const response = await fetch("/api/uploadFile", {
          method: "POST",
          headers: { Authorization: `Bearer ${userData?.token}` },
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
  
        const result = await response.json();
        return { ...result, originalFile: file };
      });
  
      const settled = await Promise.allSettled(uploadPromises);
  
      const succeededFiles = [];
      let successCount = 0;
  
      settled.forEach((s) => {
        if (s.status === "fulfilled") {
          const res = s.value;
          succeededFiles.push(res.originalFile);
          successCount++;
          setAttachments((prev) =>
            prev.map((att) => {
              if (att.originalFile === res.originalFile) {
                if (att.objectUrl) {
                  try {
                    URL.revokeObjectURL(att.objectUrl);
                  } catch {}
                }
                const isImage = ["png", "jpg", "jpeg", "svg", "webp"].includes(att.ext);
                return {
                  ...att,
                  url: res.url || res.fileUrl || att.url,
                  fileName: res.fileName || att.fileName,
                  fileType: res.fileType || att.fileType,
                  fileSize: res.fileSize || att.fileSize,
                  previewUrl: isImage ? (res.url || res.fileUrl || att.previewUrl) : null,
                  isUploading: false,
                };
              }
              return att;
            })
          );
        }
      });
  
      // Remove placeholders for failed uploads
      setAttachments((prev) =>
        prev.filter((att) => {
          if (!validFiles.includes(att.originalFile)) return true;
          if (succeededFiles.includes(att.originalFile)) return true;
          if (att.objectUrl) {
            try {
              URL.revokeObjectURL(att.objectUrl);
            } catch {}
          }
          toast.error(`Failed to upload ${att.fileName}`);
          return false;
        })
      );
  
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload files");
    }
  
    e.target.value = ""; // reset
  };

  const triggerLogout = () => {
    dispatch(logout());
    router.push("/login");
  };
  
  return (
    <div className="h-screen w-full bg-brand-bg text-brand-text flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isLarge ? (sidebarOpen ? "static" : "absolute") : "fixed"
        } flex flex-col bg-brand-sidebar z-40 transition-all duration-500 ease-out ${
          isLarge
            ? sidebarOpen
              ? "w-64 border-r border-brand-border p-4 shadow-lg"
              : "inset-y-0 left-0 w-0 p-0 border-0 overflow-hidden shadow-none"
            : "inset-y-0 left-0 w-64 border-r border-brand-border p-4 shadow-lg"
        } ${
          !isLarge
            ? sidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
            : ""
        }`}
        aria-hidden={!sidebarOpen && isLarge}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between mb-4">
          <Image
            src="/assets/images/mainlogo.png"
            alt="Logo"
            width={120}
            height={30}
            className="h-6 w-auto"
          />
          <button
            className="text-brand-text hover:text-brand-muted"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <AiOutlineClose size={18} />
          </button>
        </div>
        <button
          className="w-full px-3 py-2 rounded-md bg-brand-input text-brand-text border border-brand-border text-sm"
          onClick={handleNewChat}
        >
          + New chat
        </button>
        {/* Conversations list */}
        <div className="mt-2 flex-1 overflow-y-auto scroll-smooth pr-1 hide-scrollbar">
          <div className="text-brand-muted text-xs mb-2">Chats</div>
          {userData?.token ? (
            <>
              <ul className="space-y-1">
                {loadingConvs && conversations.length === 0 ? (
                  <li className="px-2 py-1 text-brand-muted text-xs">
                    Loading…
                  </li>
                ) : conversations.length === 0 ? (
                  <li className="px-2 py-1 text-brand-muted text-xs">
                    No conversations
                  </li>
                ) : (
                  conversations.map((c) => (
                    <li
                      key={c.conversationId}
                      className={`px-2 py-1 rounded-md capitalize cursor-pointer hover:bg-brand-input text-brand-text text-sm ${
                        String(c.conversationId) === String(conversationId)
                          ? "bg-brand-input"
                          : ""
                      }`}
                      onClick={() => openConversation(c.conversationId)}
                    >
                      {c?.firstMessage?.message || "Untitled chat"}
                    </li>
                  ))
                )}
              </ul>
              {convPage < (convCount?.totalPage || 0) ? (
                <button
                  className={`mt-2 w-full px-3 py-2 rounded-md bg-brand-input text-brand-text border border-brand-border text-xs ${
                    loadingConvs || loadingConvsMore
                      ? "opacity-80 cursor-not-allowed"
                      : "hover:brightness-95"
                  }`}
                  onClick={loadMoreConversations}
                  disabled={loadingConvs || loadingConvsMore}
                >
                  {loadingConvsMore ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <InlineSpinner
                        sizeClass="w-4 h-4"
                        colorClass="border-brand-text"
                      />
                      Loading…
                    </span>
                  ) : (
                    "Load more"
                  )}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="mt-auto pt-4 border-t border-brand-border">
          {userData?.user ? (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{userData?.user?.name}</div>
                <div className="text-brand-muted">
                  {userData?.user?.email || "Not signed in"}
                </div>
              </div>
              <div className="relative">
                <button
                  className="text-brand-text hover:text-brand-muted"
                  aria-label="User menu"
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <AiOutlineDown size={16} />
                </button>
                {userMenuOpen && (
                  <div className="absolute bottom-8 right-0 w-40 bg-brand-sidebar border border-brand-border rounded-md shadow-lg p-2">
                    <button
                      className="w-full text-left px-2 py-2 hover:bg-brand-input rounded-md"
                      onClick={triggerLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center bg-brand-primary hover:bg-brand-primary/80 text-brand-white rounded-md px-3 py-2"
            >
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile overlay when sidebar open */}
      {!isLarge && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-out"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat area */}
      <section className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-brand-sidebar/80 backdrop-blur-md border-b border-brand-border">
          <div className="flex items-center justify-between px-3 py-4">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-md bg-brand-input border border-brand-border text-brand-text lg:hidden"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? (
                  <AiOutlineClose size={18} />
                ) : (
                  <CgMenuLeft size={18} />
                )}
              </button>
              {isLarge && !sidebarOpen && (
                <button
                  className="hidden lg:inline-flex p-2 rounded-md bg-brand-input border border-brand-border text-brand-text"
                  aria-label="Open sidebar"
                  onClick={() => setSidebarOpen(true)}
                >
                  <CgMenuLeft size={18} />
                </button>
              )}
              <span className="text-brand-text font-medium"> AI Sales Forecasting outine</span>
            </div>
            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {userData?.token && (
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-black transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 hide-scrollbar scroll-smooth"
        >
          <div className="flex justify-center">
            <div className="text-brand-muted text-xs bg-brand-sidebar border border-brand-border rounded-full px-3 py-1">
              AI Sales can make mistakes. Check important info.
            </div>
          </div>
          {conversationId && (
            <div className="flex justify-center">
              {msgCount?.currentPageSize === 10 &&
              msgPage < (msgCount?.totalPage || 0) ? (
                <button
                  className="mt-2 px-3 py-1 rounded-md bg-brand-input text-brand-text border border-brand-border text-xs"
                  onClick={loadMoreMessages}
                  disabled={loadingMsgs}
                >
                  {loadingMsgs ? (
                    <span className="inline-flex items-center gap-2">
                      <InlineSpinner
                        sizeClass="w-4 h-4"
                        colorClass="border-brand-text"
                      />
                      Loading…
                    </span>
                  ) : (
                    "Load older messages"
                  )}
                </button>
              ) : null}
            </div>
          )}
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
            messages.map((m, idx) => {
            const role = m.role || (m.type === "user" ? "user" : "assistant");
            const isUser = role === "user";
            const content = m.content ?? m.message;
            return (
              <div
                key={m._id || idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    isUser
                      ? "bg-brand-input border border-brand-border rounded-xl p-3 inline-block w-fit max-w-[92%] sm:max-w-[65ch] lg:max-w-[75ch]"
                      : "bg-brand-sidebar border border-brand-border rounded-xl p-3 inline-block w-fit max-w-[92%] sm:max-w-[65ch] lg:max-w-[75ch]"
                  }
                >
                  <div className="text-brand-text whitespace-pre-wrap break-words">
                    {m.isThinking ? (
                      <div className="flex items-center gap-2">
                        <span>Thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                        </div>
                        
                      </div>
                    ) : (
                      content
                    )}
                  </div>
                  {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 w-full">
                      {m.attachments.map((file, i) => {
                        const mimeType = file.type || file.fileType || "";
                        const isImage = mimeType.startsWith("image/");
                        const fileName = file.name || file.fileName;
                        const fileUrl = file.url || file.fileUrl || (file.originalFile ? URL.createObjectURL(file.originalFile) : null);
                        
                        return (
                          <div
                            key={i}
                            className="border border-brand-border rounded-md p-2 bg-brand-sidebar w-full sm:w-auto"
                          >
                            {isImage && fileUrl ? (
                              <img
                                src={fileUrl}
                                alt={fileName}
                                loading="lazy"
                                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md"
                                onError={(e) => {
                                  // Fallback to file icon if image fails to load
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            <div 
                              className={`flex items-center gap-2 text-brand-text ${isImage && fileUrl ? 'hidden' : 'flex'}`}
                            >
                              <AiOutlineFile />
                              <div className="flex flex-col">
                                <span className="text-xs truncate max-w-[10rem]">
                                  {fileName}
                                </span>
                                {file.size && (
                                  <span className="text-xs text-brand-muted">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-xs text-brand-accent hover:underline"
                              >
                                View
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Composer */}
        <div className="px-4 sm:px-6 py-4 border-t border-brand-border bg-brand-sidebar">
          <div className="relative">
            <input
              ref={inputRef}
              className="w-full bg-brand-input text-brand-text border border-brand-border rounded-md pl-10 pr-12 py-2"
              placeholder={
                !userData?.token && limitReached
                  ? "Please log in to continue…"
                  : "Ask anything..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={(!userData?.token && limitReached) || thinking}
            />

            {/* Plus icon inside input (opens UploadMenu) */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <button
                className={`p-1.5 rounded-md text-brand-text ${
                  !userData?.token && limitReached
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:text-brand-muted"
                }`}
                aria-label="Add attachments"
                onClick={() => {
                  if (!userData?.token && limitReached) return;
                  setUploadMenuOpen((v) => !v);
                }}
                disabled={!userData?.token && limitReached}
              >
                <AiOutlinePlus size={18} />
              </button>

              {/* Floating UploadMenu anchored above the plus icon */}
              <div className="relative">
                <UploadMenu
                  isOpen={uploadMenuOpen}
                  onClose={() => setUploadMenuOpen(false)}
                  onImageChange={handleFiles}
                  onFileChange={handleFiles}
                />
              </div>
            </div>

            {/* Send icon inside input */}
            <button
              className={`absolute right-2 text-white top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-brand-accent hover:bg-brand-accent/90 ${thinking ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Send message"
              onClick={sendMessage}
              disabled={thinking}
            >
              <RiSendPlane2Line size={18} />
            </button>

            {/* Old attachment popup and hidden input removed in favor of UploadMenu */}
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((file, idx) => {
                const isImage = file?.ext ? (file.ext === "png" || file.ext === "jpg") : ((file?.fileType || file?.originalFile?.type || "").startsWith("image/"));
                return (
                  isImage ? (
                    <div key={`curr-${idx}`} className="relative w-24 h-24 border border-brand-border rounded-md overflow-hidden">
                      {file.previewUrl || file.url ? (
                        <img src={file.previewUrl || file.url} alt={file.fileName || file.originalFile?.name || "image"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">No preview</div>
                      )}
                      {file.isUploading && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <InlineSpinner sizeClass="w-5 h-5" colorClass="border-white" />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setAttachments((prev) => {
                            const target = prev[idx];
                            if (target?.objectUrl) {
                              try { URL.revokeObjectURL(target.objectUrl); } catch {}
                            }
                            return prev.filter((_, i) => i !== idx);
                          });
                        }}
                        className="absolute top-1 right-1 text-white bg-black/40 rounded-full w-5 h-5 flex items-center justify-center"
                        aria-label="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div key={`curr-${idx}`} className="relative text-xs text-brand-muted border border-brand-border rounded-md px-2 py-1 flex items-center gap-2">
                      <AiOutlineFile size={12} />
                      <span>{file.fileName || file.originalFile?.name}</span>
                      {file.isUploading ? (
                        <span className="inline-flex items-center ml-1"><InlineSpinner sizeClass="w-4 h-4" colorClass="border-brand-text" /></span>
                      ) : null}
                      <button
                        onClick={() => {
                          setAttachments((prev) => {
                            const target = prev[idx];
                            if (target?.objectUrl) {
                              try { URL.revokeObjectURL(target.objectUrl); } catch {}
                            }
                            return prev.filter((_, i) => i !== idx);
                          });
                        }}
                        className="text-brand-accent hover:text-brand-text ml-1"
                        aria-label="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  )
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
