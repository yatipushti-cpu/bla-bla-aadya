import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

export default function Messages() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleSearchQuery, setPeopleSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user,
    retry: false,
    meta: {
      onError: (error: Error) => {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }
      }
    }
  });

  const { data: currentConversation, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', selectedContact?.contactId || selectedContact?.id],
    enabled: !!selectedContact,
    retry: false,
  });

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: string; content: string }) => {
      return await apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedContact?.contactId || selectedContact?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    // Use contactId for existing conversations, or id for new contacts from search
    const receiverId = selectedContact.contactId || selectedContact.id;
    
    sendMessageMutation.mutate({
      receiverId: receiverId,
      content: messageInput.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startConversation = (selectedUser: any) => {
    // Set the selected contact with proper structure
    setSelectedContact({
      id: selectedUser.id,
      contactId: selectedUser.id,
      contactName: selectedUser.displayName || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim(),
      contactEmail: selectedUser.email,
      contactImage: selectedUser.profileImageUrl,
      displayName: selectedUser.displayName,
      email: selectedUser.email,
      profileImageUrl: selectedUser.profileImageUrl
    });
    
    // Clear search states
    setPeopleSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
    
    // Switch to conversations tab
    setActiveTab("conversations");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talent-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Get unique conversations grouped by contact
  const uniqueConversations = conversations ?
    conversations.reduce((acc: any[], curr: any) => {
      const existingIndex = acc.findIndex(item => item.contactId === curr.contactId);
      if (existingIndex === -1) {
        acc.push(curr);
      } else if (new Date(curr.createdAt) > new Date(acc[existingIndex].createdAt)) {
        acc[existingIndex] = curr;
      }
      return acc;
    }, []) : [];

  const filteredConversations = uniqueConversations.filter((conv: any) =>
    conv.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContact = selectedContact ?
    uniqueConversations.find((conv: any) => conv.contactId === selectedContact.id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white h-screen flex">
          {/* Conversations and People Search */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="conversations">Conversations</TabsTrigger>
                  <TabsTrigger value="people">Find People</TabsTrigger>
                </TabsList>

                <TabsContent value="conversations" className="mt-4">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talent-primary focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-conversations"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="people" className="mt-4">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <Input
                      type="text"
                      placeholder="Search people by name or email..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talent-primary focus:border-transparent"
                      value={peopleSearchQuery}
                      onChange={(e) => {
                        setPeopleSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      data-testid="input-search-people"
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && (searchResults.length > 0 || isSearching) && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-talent-primary mx-auto mb-2"></div>
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((user: any) => (
                            <div
                              key={user.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => startConversation(user)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                  <img
                                    src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`}
                                  </p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "conversations" ? (
                conversationsLoading ? (
                  <div className="p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation: any) => (
                    <div
                      key={conversation.contactId}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        (selectedContact?.contactId || selectedContact?.id) === conversation.contactId ? 'bg-blue-50 border-l-4 border-l-talent-primary' : ''
                      }`}
                      onClick={() => setSelectedContact(conversation)}
                      data-testid={`conversation-${conversation.contactId}`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={conversation.contactImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                          alt="Contact"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.contactName || 'Unknown Contact'}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.content || 'No messages yet'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {conversation.contactEmail}
                            </span>
                            {!conversation.isRead && conversation.senderId !== user.id && (
                              <div className="w-2 h-2 bg-talent-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                )
              ) : (
                // People search tab content
                <div className="p-4">
                  <p className="text-gray-500 text-sm mb-4">
                    Search for people above using the "Find People" tab search bar to start a conversation.
                  </p>
                  {peopleSearchQuery.length >= 3 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Search Results:</h4>
                      {isSearching ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-talent-primary mx-auto mb-2"></div>
                          <p className="text-gray-500">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((user: any) => (
                            <div
                              key={user.id}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => startConversation(user)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || `${user.firstName || ''} ${user.lastName || ''}`)}&background=3b82f6&color=fff&size=40`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || `${user.firstName || ''} ${user.lastName || ''}`)}&background=3b82f6&color=fff&size=40`;
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`}
                                  </p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedContact.profileImageUrl || selectedContact.contactImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"}
                        alt="Contact"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedContact.displayName || selectedContact.contactName || 'Unknown Contact'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedContact.email || selectedContact.contactEmail}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Online now</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" size="sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-talent-primary"></div>
                    </div>
                  ) : currentConversation && currentConversation.length > 0 ? (
                    currentConversation.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.senderId === user.id ? 'justify-end' : ''
                        }`}
                        data-testid={`message-${message.id}`}
                      >
                        {message.senderId !== user.id && (
                          <img
                            src={selectedContact.profileImageUrl || selectedContact.contactImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
                            alt="Sender"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className={`max-w-xs lg:max-w-md ${message.senderId === user.id ? 'order-first' : ''}`}>
                          <div
                            className={`p-4 rounded-2xl shadow-sm ${
                              message.senderId === user.id
                                ? 'bg-gradient-to-r from-talent-primary to-talent-accent text-white rounded-tr-md'
                                : 'bg-white text-gray-900 rounded-tl-md'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-2 ${
                            message.senderId === user.id ? 'text-right' : ''
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-500">Start your conversation</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        className="pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-talent-primary focus:border-transparent transition-colors duration-200"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendMessageMutation.isPending}
                        data-testid="input-message"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="w-10 h-10 flex items-center justify-center bg-talent-primary text-white rounded-full hover:bg-talent-secondary transition-colors duration-200 disabled:opacity-50"
                        data-testid="button-send-message"
                      >
                        {sendMessageMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}