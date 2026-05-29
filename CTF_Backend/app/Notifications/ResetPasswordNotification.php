<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    // ✅ Redirige vers ton frontend React au lieu de Laravel
    protected function resetUrl($notifiable): string
    {
        return config('app.frontend_url')
            . '/reset-password?token='
            . $this->token
            . '&email='
            . urlencode($notifiable->getEmailForPasswordReset());
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🏴 Récupération de mot de passe — Pirate Cyber')
            ->greeting("Ahoy {$notifiable->username} !")
            ->line('Tu as demandé à réinitialiser ton mot de passe.')
            ->action('Réinitialiser mon mot de passe', $this->resetUrl($notifiable))
            ->line('Ce lien expire dans 60 minutes.')
            ->line('Si tu n\'as pas fait cette demande, ignore cet email.')
            ->salutation('— Pirate Cyber CTF');
    }
}
