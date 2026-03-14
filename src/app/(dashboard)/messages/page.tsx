'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, MailOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: { full_name: string };
}

export default function MessagesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(full_name)')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      setMessages(data || []);
      setLoading(false);
    }
    fetchMessages();
  }, []);

  async function toggleExpand(msg: Message) {
    if (expandedId === msg.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(msg.id);

    if (!msg.read) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', msg.id);

      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, read: true } : m)
      );
    }
  }

  const gradientColors = [
    'from-violet-500 to-indigo-500',
    'from-cyan-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500',
    'from-blue-500 to-indigo-500',
  ];

  return (
    <>
      <PageHeader title="Messages" description="View and manage your inbox">
        <Link href="/messages/new">
          <Button size="sm">
            <MessageSquare className="h-4 w-4" />
            New Message
          </Button>
        </Link>
      </PageHeader>

      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground py-8">Loading messages...</p>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground py-8">No messages in your inbox.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((msg, i) => (
            <Card
              key={msg.id}
              className={`group cursor-pointer hover:ring-glow transition-all duration-300 ${!msg.read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
              onClick={() => toggleExpand(msg)}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center shadow-lg`}>
                    {msg.read ? (
                      <MailOpen className="h-4 w-4 text-white" />
                    ) : (
                      <Mail className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`text-sm truncate ${!msg.read ? 'font-bold' : 'font-medium'}`}>
                          {msg.subject}
                        </p>
                        <Badge variant={msg.read ? 'secondary' : 'default'}>
                          {msg.read ? 'read' : 'unread'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {expandedId === msg.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From: {msg.sender?.full_name || 'Unknown'}
                    </p>
                    {expandedId !== msg.id && (
                      <p className="text-sm text-muted-foreground mt-1.5 truncate">
                        {msg.content}
                      </p>
                    )}
                    {expandedId === msg.id && (
                      <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
