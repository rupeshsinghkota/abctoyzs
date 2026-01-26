"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function TestDB() {
    const supabase = createClient();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function checkConnection() {
            try {
                // Try to select from products table
                const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

                if (error) {
                    // Check if error is because table doesn't exist (code 42P01 in Postgres, but Supabase might return different API error)
                    if (error.code === '42P01' || error.message.includes('relation "products" does not exist')) {
                        setStatus('error');
                        setMessage('Connection successful, but "products" table does not exist. Please run the schema.sql in Supabase SQL Editor.');
                    } else {
                        setStatus('error');
                        setMessage(`Connection error: ${error.message} (Code: ${error.code})`);
                    }
                } else {
                    setStatus('success');
                    setMessage('Successfully connected to Supabase! Products table found.');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(`Unexpected error: ${err.message}`);
            }
        }

        checkConnection();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xl space-y-4">
                <h1 className="text-xl font-bold">Supabase Connection Test</h1>

                <div className={`p-4 rounded-lg text-sm font-medium ${status === 'loading' ? 'bg-blue-50 text-blue-700' :
                        status === 'success' ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-700'
                    }`}>
                    {status === 'loading' && 'Testing connection...'}
                    {status === 'success' && '✅ Connected Successfully'}
                    {status === 'error' && '❌ Connection Issue'}
                </div>

                <p className="text-muted-foreground text-sm">{message}</p>

                {status === 'error' && message.includes('schema.sql') && (
                    <div className="bg-slate-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                        Copy the content of schema.sql and run it in your Supabase Dashboard SQL Editor.
                    </div>
                )}
            </div>
        </div>
    );
}
