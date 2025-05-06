<?php

namespace App\Events;

use App\Models\Alert;
use App\Models\User;
use Mailgun\Mailgun;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AlertCreated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $alert;
    public $recipients;

    public function __construct(Alert $alert, $recipients = [])
    {
        $this->alert = $alert;
        $this->recipients = $recipients;

        //email
        $this->sendEmail();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('alerts.public');
    }
    
    public function broadcastWith(): array
    {
        $filtered = collect($this->recipients)->filter(function ($user) {
            return !str_contains($user->email, '@example');
        });
    
        $recipientSummary = $filtered
            ->map(fn($user) => "{$user->id}:{$user->email}")
            ->join(', ');
    
        Log::info("Broadcasting Alert ID {$this->alert->id} to non-example recipients: {$recipientSummary}");
    
        return [
            'alert' => $this->alert->toArray(),
            'recipients' => $filtered->map(fn($user) => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role->role_name ?? 'unknown',
            ]),
        ];
    }
    

    public function broadcastAs(): string
    {
        return 'alert.created';
    }

    protected function sendEmail()
    {
        $apiKey = env('MAILGUN_SECRET');
        $domain = env('MAILGUN_DOMAIN');
        $mg = Mailgun::create($apiKey);

        $message = $this->alert->message;
        $type = $this->alert->type;
        $expiry = optional($this->alert->expiry)->format('Y-m-d H:i');

        $users = collect($this->recipients)->filter(function ($user) {
            return !str_contains($user->email, '@example');
        });

        $userEmails = $users->pluck('email')->filter()->join(', ');
        Log::info("Sending alert only to real emails: {$userEmails}");

        foreach ($users as $user) {
            if (empty($user->email)) {
                Log::warning("Skipped user ID {$user->id} (no email)");
                continue;
            }

            Log::info("Sending alert email to User ID: {$user->id}, Email: {$user->email}");

            $mg->messages()->send($domain, [
                'from'    => 'Park Alerts <postmaster@' . $domain . '>',
                'to'      => $user->email,
                'subject' => 'New Alert Notification',
                'text'    => "Alert Type: $type\n\nMessage: $message\n\nExpires: $expiry",
            ]);
        }

        Log::info('Alert email sending complete. Total emails sent: ' . $users->count());
    }
}
