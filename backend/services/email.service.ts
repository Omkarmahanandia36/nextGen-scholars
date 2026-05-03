import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendScheduleEmail = async (formData: any) => {
  const { studentName, email, phone, courseName, subjects, preferredDays, preferredTime, message } = formData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New Class Schedule Request from ${studentName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #2563eb, #14b8a6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NextGen Scholar</h1>
          <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 16px;">New Class Schedule Request</p>
        </div>
        
        <div style="padding: 10px 20px;">
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Student Name</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${studentName}</p>
          </div>
          
          <div style="grid-template-cols: 1fr 1fr; display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Email</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
            </div>
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Phone</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${phone}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Course & Subjects</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${courseName} - ${subjects.join(', ')}</p>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Preferred Schedule</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${preferredDays.join(', ')} at ${preferredTime}</p>
          </div>

          ${message ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Additional Message</p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.5; margin: 0;">${message}</p>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>NextGen Scholar &copy; 2026 | Automated Notification</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

export const sendMeetingEmail = async (formData: any) => {
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #3b82f6, #06b6d4); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NextGen Scholar</h1>
          <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 16px;">Meeting/Inquiry Request</p>
        </div>
        
        <div style="padding: 10px 20px;">
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">From</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${name}</p>
          </div>
          
          <div style="grid-template-cols: 1fr 1fr; display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Email</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
            </div>
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Phone</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${phone}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Request Type</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${typeLabels[type] || type}</p>
          </div>

          ${type !== 'message' ? `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Preferred Time</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${preferredDate} at ${preferredTime}</p>
          </div>
          ` : ''}

          ${message ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Message/Notes</p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.5; margin: 0;">${message}</p>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>NextGen Scholar &copy; 2026 | Automated Notification</p>
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #6366f1, #a855f7); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NextGen Scholar</h1>
          <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 16px;">New Newsletter Subscriber</p>
        </div>
        
        <div style="padding: 10px 20px; text-align: center;">
          <p style="color: #64748b; font-size: 16px; margin-bottom: 10px;">You have a new newsletter subscriber:</p>
          <p style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">${email}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>NextGen Scholar &copy; 2026 | Automated Notification</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

export const sendTutorRegistrationEmail = async (formData: any) => {
  const { fullName, email, phone, qualification, specialization, subjects, experience, teachingMode } = formData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nextgenscholar02@gmail.com',
    subject: `New Tutor Application: ${fullName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #f59e0b, #ef4444); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NextGen Scholar</h1>
          <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 16px;">New Tutor Registration Request</p>
        </div>
        
        <div style="padding: 10px 20px;">
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Applicant Name</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${fullName}</p>
          </div>
          
          <div style="grid-template-cols: 1fr 1fr; display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Email</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
            </div>
            <div style="flex: 1; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Phone</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${phone}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Academic Profile</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${qualification} in ${specialization}</p>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Teaching Profile</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">
              Subjects: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}<br/>
              Experience: ${experience} years<br/>
              Modes: ${Array.isArray(teachingMode) ? teachingMode.join(', ') : teachingMode}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>NextGen Scholar &copy; 2026 | Automated Notification</p>
        </div>
      </div>
    `,
  };

  return await sendMail(mailOptions);
};

const sendMail = async (mailOptions: any) => {
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
