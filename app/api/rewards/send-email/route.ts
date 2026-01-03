import { NextRequest, NextResponse } from 'next/server';
import { getRewardConfig } from '@/lib/rewards/reward-config';

// Email template generators
function generateTemplateDownloadEmail(
  rewardTitle: string,
  downloadLink: string,
  userName?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="background: white; color: #333; padding: 30px; border-radius: 8px;">
        <h1 style="color: #39d2c0; margin: 0 0 20px 0;">Your Reward is Ready! 🎉</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">${userName ? `Hi ${userName},` : 'Hi there,'}</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Congratulations! You've successfully redeemed your reward:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">${rewardTitle}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Click the button below to download your reward:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadLink}" style="background: #39d2c0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Now</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin: 15px 0; color: #666;">This link will remain active for 30 days. You can also access your rewards anytime in the DreamScale app.</p>
        <hr style="border: none; border-top: 2px solid #39d2c0; margin: 25px 0;">
        <p style="font-size: 12px; margin: 20px 0 0 0; color: #999;">DreamScale Team</p>
      </div>
    </div>
  `;
}

function generateToolDownloadEmail(
  rewardTitle: string,
  downloadLink: string,
  userName?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="background: white; color: #333; padding: 30px; border-radius: 8px;">
        <h1 style="color: #39d2c0; margin: 0 0 20px 0;">Your Tool is Ready! 🛠️</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">${userName ? `Hi ${userName},` : 'Hi there,'}</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Great news! Your redeemed tool is ready for download:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">${rewardTitle}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Click the button below to download:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadLink}" style="background: #39d2c0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Tool</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin: 15px 0; color: #666;">This link will remain active for 30 days.</p>
        <hr style="border: none; border-top: 2px solid #39d2c0; margin: 25px 0;">
        <p style="font-size: 12px; margin: 20px 0 0 0; color: #999;">DreamScale Team</p>
      </div>
    </div>
  `;
}

function generateBadgeUnlockEmail(
  badgeName: string,
  userName?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="background: white; color: #333; padding: 30px; border-radius: 8px;">
        <h1 style="color: #39d2c0; margin: 0 0 20px 0;">Badge Unlocked! 🏆</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">${userName ? `Hi ${userName},` : 'Hi there,'}</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Congratulations! You've unlocked a new badge:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">${badgeName}</h2>
          <p style="font-size: 14px; color: #666; margin: 0;">This badge is now displayed on your profile!</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Keep up the great work and unlock more badges as you progress!</p>
        <hr style="border: none; border-top: 2px solid #39d2c0; margin: 25px 0;">
        <p style="font-size: 12px; margin: 20px 0 0 0; color: #999;">DreamScale Team</p>
      </div>
    </div>
  `;
}

function generateEarlyAccessEmail(
  userName?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="background: white; color: #333; padding: 30px; border-radius: 8px;">
        <h1 style="color: #39d2c0; margin: 0 0 20px 0;">Early Access Granted! ⚡</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">${userName ? `Hi ${userName},` : 'Hi there,'}</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">You now have early access to new platform features!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">As an early access member, you'll be the first to try new features and provide feedback. Look for the "Early Access" badge on new features in the app!</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">Thank you for being part of the DreamScale community!</p>
        <hr style="border: none; border-top: 2px solid #39d2c0; margin: 25px 0;">
        <p style="font-size: 12px; margin: 20px 0 0 0; color: #999;">DreamScale Team</p>
      </div>
    </div>
  `;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DreamScale <onboarding@resend.dev>',
        to: to,
        subject: subject,
        html: html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}

async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@dreamscale.app' },
        subject: subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rewardId, email, userName, downloadLink, rewardTitle } = await req.json();

    if (!email || !rewardId) {
      return NextResponse.json(
        { error: 'Email and reward ID are required' },
        { status: 400 }
      );
    }

    const rewardConfig = getRewardConfig(rewardId);
    if (!rewardConfig) {
      return NextResponse.json(
        { error: 'Invalid reward ID' },
        { status: 400 }
      );
    }

    let htmlContent: string;
    let subject: string;

    // Generate email content based on reward type
    switch (rewardConfig.fulfillmentType) {
      case 'download':
        if (rewardConfig.emailTemplate === 'template_download') {
          htmlContent = generateTemplateDownloadEmail(
            rewardTitle || rewardConfig.title,
            downloadLink || '',
            userName
          );
          subject = `Your ${rewardTitle || rewardConfig.title} is Ready!`;
        } else {
          htmlContent = generateToolDownloadEmail(
            rewardTitle || rewardConfig.title,
            downloadLink || '',
            userName
          );
          subject = `Your ${rewardTitle || rewardConfig.title} is Ready!`;
        }
        break;

      case 'badge':
        htmlContent = generateBadgeUnlockEmail(
          rewardTitle || rewardConfig.title,
          userName
        );
        subject = 'Badge Unlocked! 🏆';
        break;

      case 'feature':
        htmlContent = generateEarlyAccessEmail(userName);
        subject = 'Early Access Granted! ⚡';
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported reward type for email' },
          { status: 400 }
        );
    }

    // Try to send email via Resend or SendGrid
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      emailSent = await sendEmailViaResend(email, subject, htmlContent);
    } else if (process.env.SENDGRID_API_KEY) {
      emailSent = await sendEmailViaSendGrid(email, subject, htmlContent);
    }

    // Log for testing/demo
    if (!emailSent) {
      console.log(`📧 Reward email generated for: ${email}`);
      console.log(`📧 Reward: ${rewardTitle || rewardConfig.title}`);
      console.log('📧 Email service not configured - set RESEND_API_KEY or SENDGRID_API_KEY to send emails');
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        message: emailSent
          ? 'Email sent successfully'
          : 'Email generated (service not configured)',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reward email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send reward email', success: false },
      { status: 500 }
    );
  }
}
