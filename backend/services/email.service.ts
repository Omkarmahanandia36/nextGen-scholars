import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface ScheduleFormData {
  studentName: string;
  email: string;
  phone: string;
  courseName: string;
  subjects: string[];
  preferredDays: string[];
  preferredTime: string;
  message?: string;
}

interface MeetingFormData {
  name: string;
  email: string;
  phone: string;
  type: 'call' | 'video' | 'message';
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

interface TutorFormData {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  subjects: string[] | string;
  experience: string;
  teachingMode: string[] | string;
}

interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export const sendScheduleEmail = async (formData: ScheduleFormData) => {
  const { studentName, email, phone, courseName, subjects, preferredDays, preferredTime, message } = formData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New Class Schedule Request from ${studentName}`,
    html: `
      <div style="max-width: 580px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #14b8a6 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">NextGen Scholar</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 500; letter-spacing: 0.5px;">NEW CLASS SCHEDULE REQUEST</p>
        </div>
        
        <div style="padding: 30px 40px; background-color: #ffffff;">
          
          <!-- Student Name Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Student Name</p>
            <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">${studentName}</p>
          </div>
          
          <!-- Contact Grid (Table-based for email client compatibility) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
            <tr>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-right: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Email</p>
                <a href="mailto:${email}" style="color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none; word-break: break-all;">${email}</a>
              </td>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-left: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Phone</p>
                <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0;">${phone}</p>
              </td>
            </tr>
          </table>

          <!-- Course & Subjects Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Course & Subjects</p>
            <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0;">
              <span style="display: inline-block; background-color: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; margin-right: 6px; margin-bottom: 4px; vertical-align: middle;">${courseName}</span>
              <span style="font-size: 14px; color: #334155; vertical-align: middle;">${subjects.join(', ')}</span>
            </p>
          </div>

          <!-- Schedule Preferences -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Preferred Schedule</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; font-size: 14px; font-weight: 600; color: #0f172a;">
                  📅 ${preferredDays.join(', ')}
                </td>
                <td style="text-align: right; vertical-align: middle; font-size: 14px; font-weight: 600; color: #0f172a;">
                  ⏰ ${preferredTime}
                </td>
              </tr>
            </table>
          </div>

          <!-- Additional Message Section -->
          ${message ? `
          <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #14b8a6; border-radius: 8px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">Additional Message</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}
          
        </div>

        <div style="background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">NextGen Scholar Academy &bull; Professional Administrative Portal</p>
          <p style="margin: 0;">This is an automated notification. Please do not reply directly to this mail.</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

export const sendMeetingEmail = async (formData: MeetingFormData) => {
  const { name, email, phone, type, preferredDate, preferredTime, message } = formData;

  const typeLabels: Record<string, string> = {
    call: 'Audio Call',
    video: 'Video Call',
    message: 'General Inquiry'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New ${typeLabels[type] || 'Meeting'} Request from ${name}`,
    html: `
      <div style="max-width: 580px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">NextGen Scholar</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 500; letter-spacing: 0.5px;">MEETING & INQUIRY REQUEST</p>
        </div>
        
        <div style="padding: 30px 40px; background-color: #ffffff;">
          
          <!-- Name Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Request From</p>
            <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">${name}</p>
          </div>
          
          <!-- Contact Grid (Table-based for compatibility) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
            <tr>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-right: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Email</p>
                <a href="mailto:${email}" style="color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none; word-break: break-all;">${email}</a>
              </td>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-left: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Phone</p>
                <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0;">${phone}</p>
              </td>
            </tr>
          </table>

          <!-- Request Type Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Request Type</p>
            <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0;">
              <span style="display: inline-block; background-color: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; vertical-align: middle;">${typeLabels[type] || type}</span>
            </p>
          </div>

          <!-- Preferred Date/Time for Calls/Videos -->
          ${type !== 'message' ? `
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Preferred Date & Time</p>
            <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0;">📅 ${preferredDate} at ⏰ ${preferredTime}</p>
          </div>
          ` : ''}

          <!-- Message/Notes Section -->
          ${message ? `
          <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #06b6d4; border-radius: 8px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">Message / Inquiry Details</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          ` : ''}
          
        </div>

        <div style="background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">NextGen Scholar Academy &bull; Professional Administrative Portal</p>
          <p style="margin: 0;">This is an automated notification. Please do not reply directly to this mail.</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

export const sendNewsletterEmail = async (email: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New Newsletter Subscription: ${email}`,
    html: `
      <div style="max-width: 580px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">NextGen Scholar</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 500; letter-spacing: 0.5px;">NEW NEWSLETTER SUBSCRIPTION</p>
        </div>
        
        <div style="padding: 30px 40px; background-color: #ffffff;">
          
          <div style="text-align: center; padding: 10px 0;">
            <p style="color: #64748b; font-size: 15px; margin: 0 0 20px 0;">You have received a new newsletter subscriber! The email address has been registered successfully:</p>
            
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px 30px; margin-bottom: 10px; width: 100%; box-sizing: border-box;">
              <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">Subscriber Email</p>
              <a href="mailto:${email}" style="color: #4f46e5; font-size: 22px; font-weight: 800; text-decoration: none; word-break: break-all;">${email}</a>
            </div>
          </div>
          
        </div>

        <div style="background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">NextGen Scholar Academy &bull; Professional Administrative Portal</p>
          <p style="margin: 0;">This is an automated notification. Please do not reply directly to this mail.</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

export const sendTutorRegistrationEmail = async (formData: TutorFormData) => {
  const { fullName, email, phone, qualification, specialization, subjects, experience, teachingMode } = formData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New Tutor Application: ${fullName}`,
    html: `
      <div style="max-width: 580px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #dc2626 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">NextGen Scholar</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 500; letter-spacing: 0.5px;">NEW TUTOR APPLICATION</p>
        </div>
        
        <div style="padding: 30px 40px; background-color: #ffffff;">
          
          <!-- Name Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Applicant Name</p>
            <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">${fullName}</p>
          </div>
          
          <!-- Contact Grid (Table-based for compatibility) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
            <tr>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-right: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Email</p>
                <a href="mailto:${email}" style="color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none; word-break: break-all;">${email}</a>
              </td>
              <td width="50%" style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-left: 15px; vertical-align: top;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Phone</p>
                <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0;">${phone}</p>
              </td>
            </tr>
          </table>

          <!-- Academic Profile Section -->
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">Academic Profile</p>
            <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0;">
              🎓 ${qualification} <span style="color: #64748b; font-size: 14px; font-weight: 400;">in</span> ${specialization}
            </p>
          </div>

          <!-- Teaching Profile Section -->
          <div style="margin-top: 25px; padding: 20px; background-color: #fffbeb; border-left: 4px solid #d97706; border-radius: 8px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 10px 0;">Teaching Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 8px; font-size: 14px; color: #475569; font-weight: 500;">Subjects:</td>
                <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
                  ${Array.isArray(subjects) ? subjects.join(', ') : subjects}
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; font-size: 14px; color: #475569; font-weight: 500;">Experience:</td>
                <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
                  ${experience} Years
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; color: #475569; font-weight: 500;">Teaching Modes:</td>
                <td style="font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
                  ${Array.isArray(teachingMode) ? teachingMode.join(', ') : teachingMode}
                </td>
              </tr>
            </table>
          </div>
          
        </div>

        <div style="background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">NextGen Scholar Academy &bull; Professional Administrative Portal</p>
          <p style="margin: 0;">This is an automated notification. Please do not reply directly to this mail.</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

const sendMail = async (mailOptions: MailOptions) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('EMAIL_USER or EMAIL_PASS not found in environment variables. Logging email content instead:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      return { success: true, mocked: true };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
