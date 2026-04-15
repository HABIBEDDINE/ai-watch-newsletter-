"""
AI Watch - Newsletter Module
V2: Generates and sends HTML newsletters via SMTP.
"""
import os
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from collections import Counter
from dotenv import load_dotenv
from pathlib import Path

# Ensure stdout/stderr can handle Unicode on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")


def get_smtp_config():
    """Load SMTP configuration from environment."""
    config = {
        'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
        'port': int(os.getenv('SMTP_PORT', 587)),
        'username': os.getenv('SMTP_USERNAME'),
        'password': os.getenv('SMTP_PASSWORD'),
        'from_email': os.getenv('SMTP_FROM_EMAIL'),
        'to_emails': os.getenv('NEWSLETTER_RECIPIENTS', '').split(',')
    }
    return config


def generate_newsletter_html(articles, topic="All Topics", date_str=None):
    """Generate clean HTML email matching the Newsletter Builder preview."""
    if date_str is None:
        date_str = datetime.now().strftime("%A, %B %d, %Y")

    strong_count = sum(
        1 for a in articles
        if "STRONG" in str(a.get("signal", a.get("signal_type", a.get("signal_strength", "")))).upper()
    )

    articles_html = ""
    for a in articles:
        title_text = a.get("title", "Untitled")
        source     = a.get("source", "Unknown")
        date       = a.get("publishedAt", a.get("published_at", ""))
        url        = a.get("url", a.get("link", "#")) or "#"
        summary    = a.get("summary", a.get("description", ""))

        try:
            parsed = datetime.strptime(str(date)[:10], "%Y-%m-%d")
            date = parsed.strftime("%b %d, %Y")
        except Exception:
            pass

        summary_block = ""
        if summary and str(summary).strip():
            summary_block = (
                f'<p style="margin:6px 0 0 0;font-size:13px;color:#4b5563;line-height:1.6;">'
                f'{str(summary)[:200]}{"..." if len(str(summary)) > 200 else ""}</p>'
            )

        articles_html += (
            f'<div style="padding:16px 0;border-bottom:1px solid #f3f4f6;">'
            f'<a href="{url}" style="font-size:15px;font-weight:600;color:#111827;'
            f'text-decoration:none;line-height:1.4;display:block;">{title_text}</a>'
            f'{summary_block}'
            f'<p style="margin:6px 0 0 0;font-size:11px;color:#9ca3af;">'
            f'{source} &nbsp;&middot;&nbsp; {date}</p>'
            f'</div>'
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>AI Watch Brief</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#4c1d95;padding:36px 40px;">
      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#c4b5fd;letter-spacing:2px;text-transform:uppercase;">STRATEGIC INTELLIGENCE</p>
      <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">AI Watch Brief</h1>
      <p style="margin:0;font-size:13px;color:#ddd6fe;">{topic} Edition &nbsp;&middot;&nbsp; {date_str}</p>
    </div>

    <!-- Summary bar -->
    <div style="background:#f5f3ff;padding:20px 40px;border-bottom:1px solid #ede9fe;">
      <p style="margin:0;font-size:13px;color:#6b21a8;line-height:1.6;">
        Your curated AI intelligence brief featuring <strong>{len(articles)} signals</strong> from across the industry landscape &mdash; including <strong>{strong_count} strong signals</strong>.
      </p>
    </div>

    <!-- Article list -->
    <div style="padding:8px 40px 24px 40px;">
      <p style="font-size:11px;font-weight:700;color:#7c3aed;letter-spacing:1.5px;text-transform:uppercase;margin:24px 0 4px 0;">EMERGING SIGNALS TO WATCH</p>
      {articles_html}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">AI Watch &nbsp;&middot;&nbsp; Strategic Intelligence Platform &nbsp;&middot;&nbsp; {len(articles)} articles &nbsp;&middot;&nbsp; {topic}</p>
    </div>

  </div>
</body>
</html>"""


def generate_html_newsletter(sector_data, title="AI Watch Weekly Intelligence"):
    """
    Generate an HTML newsletter from sector data.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        title: Newsletter title
    
    Returns:
        HTML string
    """
    # Calculate stats
    total_articles = sum(len(articles) for articles in sector_data.values())
    weak_signals = sum(
        1 for articles in sector_data.values() 
        for a in articles if 'Weak' in a.get('signal_type', '')
    )
    high_relevance = sum(
        1 for articles in sector_data.values() 
        for a in articles if a.get('relevance_score', 0) >= 8
    )
    
    # Industry breakdown
    industry_counts = Counter()
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
    
    # Build HTML
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            border-bottom: 3px solid #e67e22;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #e67e22;
            margin: 0;
            font-size: 28px;
        }}
        .header .date {{
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }}
        .stats {{
            display: flex;
            justify-content: space-around;
            background: linear-gradient(135deg, #e67e22, #d35400);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .stat {{
            text-align: center;
        }}
        .stat-number {{
            font-size: 32px;
            font-weight: bold;
        }}
        .stat-label {{
            font-size: 12px;
            opacity: 0.9;
        }}
        .industry-breakdown {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .industry-breakdown h3 {{
            margin-top: 0;
            color: #e67e22;
        }}
        .industry-bar {{
            display: flex;
            align-items: center;
            margin: 8px 0;
        }}
        .industry-name {{
            width: 180px;
            font-size: 13px;
        }}
        .industry-bar-fill {{
            height: 20px;
            background: linear-gradient(90deg, #e67e22, #f39c12);
            border-radius: 4px;
            min-width: 20px;
        }}
        .industry-count {{
            margin-left: 10px;
            font-size: 13px;
            color: #666;
        }}
        .sector {{
            margin-bottom: 30px;
        }}
        .sector h2 {{
            color: #2c3e50;
            border-left: 4px solid #e67e22;
            padding-left: 15px;
            margin-bottom: 20px;
        }}
        .article {{
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }}
        .article.weak-signal {{
            border-left-color: #f1c40f;
        }}
        .article.strong-signal {{
            border-left-color: #27ae60;
        }}
        .article h3 {{
            margin: 0 0 10px 0;
            font-size: 16px;
        }}
        .article h3 a {{
            color: #2c3e50;
            text-decoration: none;
        }}
        .article h3 a:hover {{
            color: #e67e22;
        }}
        .article-meta {{
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
        }}
        .signal-badge {{
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }}
        .signal-weak {{
            background: #fef3cd;
            color: #856404;
        }}
        .signal-strong {{
            background: #d4edda;
            color: #155724;
        }}
        .signal-noise {{
            background: #e9ecef;
            color: #495057;
        }}
        .industry-tag {{
            display: inline-block;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #495057;
            margin-left: 5px;
        }}
        .article-summary {{
            font-size: 14px;
            color: #555;
        }}
        .article-summary ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .actors-info {{
            background: #e8f4f8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
            border-left: 3px solid #17a2b8;
        }}
        .startup-info {{
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }}
        .funding-info {{
            background: #d1ecf1;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }}
        .cta-button {{
            display: inline-block;
            background: #e67e22;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 {title}</h1>
            <div class="date">{datetime.now().strftime('%B %d, %Y')}</div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">{total_articles}</div>
                <div class="stat-label">Articles Analyzed</div>
            </div>
            <div class="stat">
                <div class="stat-number">{weak_signals}</div>
                <div class="stat-label">Weak Signals</div>
            </div>
            <div class="stat">
                <div class="stat-number">{high_relevance}</div>
                <div class="stat-label">High Relevance</div>
            </div>
        </div>
"""
    
    # Industry breakdown
    if industry_counts:
        html += """
        <div class="industry-breakdown">
            <h3>🏭 Industry Breakdown</h3>
"""
        max_count = max(industry_counts.values()) if industry_counts else 1
        for industry, count in industry_counts.most_common():
            width = int((count / max_count) * 150)
            html += f"""
            <div class="industry-bar">
                <span class="industry-name">{industry}</span>
                <div class="industry-bar-fill" style="width: {width}px;"></div>
                <span class="industry-count">{count}</span>
            </div>
"""
        html += "        </div>\n"
    
    # V2: Funding Highlights section
    funding_entries = []
    for articles in sector_data.values():
        for a in articles:
            funding = a.get('funding', 'None')
            if funding and funding.lower() != 'none':
                for entry in funding.split(';'):
                    entry = entry.strip()
                    if entry and entry.lower() != 'none':
                        parts = [p.strip() for p in entry.split('|')]
                        if len(parts) >= 2:
                            funding_entries.append({
                                'company': parts[0],
                                'amount': parts[1] if len(parts) > 1 else 'Undisclosed',
                                'round': parts[2] if len(parts) > 2 else '',
                                'investors': parts[3] if len(parts) > 3 else ''
                            })
    
    if funding_entries:
        html += """
        <div class="industry-breakdown" style="background: #e8f5e9; border-left: 4px solid #4caf50;">
            <h3>💰 Funding Highlights</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="background: #c8e6c9;">
                    <th style="text-align: left; padding: 8px;">Company</th>
                    <th style="text-align: left; padding: 8px;">Amount</th>
                    <th style="text-align: left; padding: 8px;">Round</th>
                    <th style="text-align: left; padding: 8px;">Investors</th>
                </tr>
"""
        for f in funding_entries[:5]:  # Top 5 funding rounds
            html += f"""
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>{f['company']}</strong></td>
                    <td style="padding: 8px; color: #2e7d32;">{f['amount']}</td>
                    <td style="padding: 8px;">{f['round']}</td>
                    <td style="padding: 8px; font-size: 11px;">{f['investors']}</td>
                </tr>
"""
        html += """
            </table>
        </div>
"""
    
    # Articles by sector
    for sector, articles in sector_data.items():
        if not articles:
            continue
            
        html += f"""
        <div class="sector">
            <h2>🏷️ {sector}</h2>
"""
        # Show top 5 articles per sector
        for article in articles[:5]:
            signal_type = article.get('signal_type', 'Noise')
            signal_class = 'weak-signal' if 'Weak' in signal_type else ('strong-signal' if 'Strong' in signal_type else '')
            badge_class = 'signal-weak' if 'Weak' in signal_type else ('signal-strong' if 'Strong' in signal_type else 'signal-noise')
            
            industry = article.get('industry', 'Other')
            segment = article.get('market_segment', '')
            industry_display = f"{industry}" + (f" > {segment}" if segment and segment != 'General' else "")
            
            title = article.get('title', 'Untitled')
            url = article.get('url', '#')
            source = article.get('source', 'Unknown')
            relevance = article.get('relevance_score', 0)
            
            # Parse summary bullets
            summary = article.get('summary', 'No summary available')
            summary_html = "<ul>"
            for line in summary.split('\n'):
                line = line.strip()
                if line.startswith('-'):
                    summary_html += f"<li>{line[1:].strip()}</li>"
            summary_html += "</ul>"
            
            html += f"""
            <div class="article {signal_class}">
                <h3><a href="{url}">{title}</a></h3>
                <div class="article-meta">
                    📰 {source} | 
                    <span class="signal-badge {badge_class}">{signal_type}</span> |
                    ⭐ {relevance}/10
                    <span class="industry-tag">🏭 {industry_display}</span>
                </div>
                <div class="article-summary">
                    {summary_html}
                </div>
"""
            # Key Actors
            key_actors = article.get('key_actors', 'None')
            if key_actors and key_actors != 'None':
                html += f"""
                <div class="actors-info">
                    👥 <strong>Key Actors:</strong> {key_actors}
                </div>
"""
            # Startups
            startups = article.get('startups', 'None')
            if startups and startups != 'None':
                html += f"""
                <div class="startup-info">
                    🚀 <strong>Startups:</strong> {startups}
                </div>
"""
            # Funding
            funding = article.get('funding', 'None')
            if funding and funding != 'None':
                html += f"""
                <div class="funding-info">
                    💰 <strong>Funding:</strong> {funding}
                </div>
"""
            # Patents
            patents = article.get('patents', 'None')
            if patents and patents.lower() != 'none':
                html += f"""
                <div class="funding-info" style="background: #fff3e0; border-left: 3px solid #ff9800;">
                    📜 <strong>Patents:</strong> {patents}
                </div>
"""
            # Publications
            publications = article.get('publications', 'None')
            if publications and publications.lower() != 'none':
                html += f"""
                <div class="funding-info" style="background: #f3e5f5; border-left: 3px solid #9c27b0;">
                    📚 <strong>Publications:</strong> {publications}
                </div>
"""
            html += "            </div>\n"
        
        html += "        </div>\n"
    
    # Footer
    html += f"""
        <div class="footer">
            <p>📌 <strong>Legend:</strong> 
                <span class="signal-badge signal-weak">Weak Signal</span> Early trends |
                <span class="signal-badge signal-strong">Strong Signal</span> Established trends
            </p>
            <p>Generated by AI Watch v2.0</p>
            <p style="color: #999;">
                You received this because you're subscribed to AI Watch Intelligence Reports.
            </p>
        </div>
    </div>
</body>
</html>
"""
    
    return html


def save_newsletter_html(html_content, output_dir=None):
    if output_dir is None:
        output_dir = str(Path(__file__).resolve().parent.parent / "data" / "reports")
    """Save newsletter as HTML file."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
    filename = f"newsletter_{timestamp}.html"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"📧 Newsletter HTML saved to: {filepath}")
    return filepath


def send_newsletter(sector_data, subject=None):
    """
    Generate and send newsletter via SMTP.

    Args:
        sector_data: Dict of {sector_name: [articles]} or flat list
        subject: Email subject (auto-generated if None)

    Returns:
        True if sent successfully, False otherwise
    """
    config = get_smtp_config()

    # Flatten sector_data into a single article list
    if isinstance(sector_data, dict):
        articles_list = [a for arts in sector_data.values() for a in arts]
        topic_name = ", ".join(sector_data.keys()) if sector_data else "All Topics"
    else:
        articles_list = list(sector_data)
        topic_name = "All Topics"

    # Validate config
    if not config['username'] or not config['password']:
        print("SMTP not configured. Saving HTML file only.")
        html = generate_newsletter_html(articles_list, topic=topic_name)
        save_newsletter_html(html)
        return False

    if not config['to_emails'] or config['to_emails'] == ['']:
        print("No recipients configured (NEWSLETTER_RECIPIENTS not set)")
        html = generate_newsletter_html(articles_list, topic=topic_name)
        save_newsletter_html(html)
        return False

    # Generate content using the new clean template
    html = generate_newsletter_html(articles_list, topic=topic_name)
    
    # Save a copy
    save_newsletter_html(html)
    
    # Create email
    if subject is None:
        subject = f"🔍 AI Watch Weekly - {datetime.now().strftime('%B %d, %Y')}"
    
    # Gmail requires From == login username; fall back to username if from_email differs
    from_addr = config['username']

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = from_addr
    msg['To'] = ', '.join(config['to_emails'])
    
    # Plain text fallback
    plain_text = f"""
AI Watch Weekly Intelligence Report
{datetime.now().strftime('%B %d, %Y')}

View this email in HTML for the best experience.

Generated by AI Watch v2.0
"""
    
    msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    
    # Send
    recipients = [r.strip() for r in config['to_emails'] if r.strip()]
    try:
        print(f"📧 Connecting to {config['host']}:{config['port']} ...")
        with smtplib.SMTP(config['host'], config['port'], timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(config['username'], config['password'])
            server.sendmail(config['username'], recipients, msg.as_string())
        print(f"✅ Newsletter sent to: {recipients}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP AUTH FAILED — check App Password in .env: {e}")
        raise
    except smtplib.SMTPException as e:
        print(f"❌ SMTP ERROR ({type(e).__name__}): {e}")
        raise
    except Exception as e:
        print(f"❌ Newsletter send failed ({type(e).__name__}): {e}")
        raise


# ── V4 Sprint 3: Alert digest email ──────────────────────────────────────────

def send_alert_digest(user_email: str, user_name: str, articles: list, unsubscribe_token: str) -> bool:
    """
    Send a digest email to one user listing articles that matched their keywords.

    Args:
        user_email:        Recipient email address
        user_name:         Display name for greeting
        articles:          List of article dicts (title, url, summary, source, signal_strength)
        unsubscribe_token: Token for one-click unsubscribe link in footer

    Returns:
        True if sent successfully, False otherwise
    """
    config = get_smtp_config()

    if not config["username"] or not config["password"]:
        print(f"[Alert] SMTP not configured — skipping digest for {user_email}")
        return False

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    unsubscribe_url = f"{frontend_url}/api/alerts/unsubscribe/{unsubscribe_token}"

    name = user_name or user_email
    count = len(articles)

    # ── Build article rows ────────────────────────────────────────────────────
    articles_html = ""
    for a in articles[:10]:  # cap at 10 per digest
        title   = a.get("title", "Untitled")
        url     = a.get("url", "#") or "#"
        summary = a.get("summary", "") or a.get("description", "") or ""
        source  = a.get("source", "Unknown")
        signal  = a.get("signal_strength", a.get("signal_type", ""))
        is_strong = "strong" in str(signal).lower()

        # Trim summary to first bullet or 160 chars
        lines = [l.lstrip("- •").strip() for l in summary.splitlines() if l.strip().startswith("-")]
        short_summary = lines[0] if lines else summary[:160]
        if short_summary and len(short_summary) == 160:
            short_summary += "…"

        signal_badge = ""
        if is_strong:
            signal_badge = (
                '<span style="display:inline-block;background:#C45F00;color:#fff;'
                'font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;'
                'letter-spacing:0.3px;margin-left:8px;">STRONG</span>'
            )

        articles_html += f"""
        <div style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
          <a href="{url}" style="font-size:15px;font-weight:700;color:#111827;
            text-decoration:none;line-height:1.4;display:block;margin-bottom:4px;">
            {title}{signal_badge}
          </a>
          {f'<p style="margin:6px 0 4px;font-size:13px;color:#4b5563;line-height:1.6;">{short_summary}</p>' if short_summary else ""}
          <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">{source}</p>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AI Watch Alert</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#1A1A2E;padding:28px 36px;">
      <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">AI Watch</span>
      <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">by DXC Technology</span>
    </div>

    <!-- Summary bar -->
    <div style="background:#e8eef8;padding:16px 36px;border-bottom:1px solid #dde5f4;">
      <p style="margin:0;font-size:13px;color:#1A4A9E;font-weight:600;">
        {count} new article{'' if count == 1 else 's'} matching your keywords
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding:24px 36px 8px;">
      <p style="margin:0;font-size:14px;color:#374151;">Hi {name},</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
        Here are the latest signals matching your alert keywords:
      </p>
    </div>

    <!-- Articles -->
    <div style="padding:0 36px 24px;">
      {articles_html}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.8;">
        AI Watch · DXC Technology · Internal use only<br>
        <a href="{unsubscribe_url}" style="color:#9ca3af;text-decoration:underline;">
          Unsubscribe from alerts
        </a>
      </p>
    </div>

  </div>
</body>
</html>"""

    # Plain-text fallback
    plain = f"AI Watch Alert — {count} new article(s) matching your keywords.\n\n"
    for a in articles[:10]:
        plain += f"- {a.get('title','Untitled')}\n  {a.get('url','')}\n\n"
    plain += f"Unsubscribe: {unsubscribe_url}"

    try:
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        import smtplib

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"AI Watch: {count} article{'' if count == 1 else 's'} matching your keywords"
        msg["From"]    = config["username"]
        msg["To"]      = user_email
        msg.attach(MIMEText(plain, "plain", "utf-8"))
        msg.attach(MIMEText(html,  "html",  "utf-8"))

        with smtplib.SMTP(config["host"], config["port"], timeout=20) as s:
            s.ehlo(); s.starttls(); s.ehlo()
            s.login(config["username"], config["password"])
            s.sendmail(config["username"], [user_email], msg.as_string())

        print(f"[Alert] ✓ Digest sent → {user_email} ({count} articles)")
        return True

    except smtplib.SMTPAuthenticationError:
        print(f"[Alert] ✗ SMTP auth failed for {user_email}")
        return False
    except Exception as e:
        print(f"[Alert] ✗ Failed to send to {user_email}: {type(e).__name__}: {e}")
        return False


if __name__ == "__main__":
    # Test with sample data
    test_data = {
        "AI & Machine Learning": [
            {
                'title': 'OpenAI Launches GPT-5 with Advanced Reasoning',
                'source': 'TechCrunch',
                'url': 'https://example.com/1',
                'summary': '- GPT-5 features breakthrough reasoning capabilities\n- 10x improvement in complex problem solving\n- Available via API immediately',
                'signal_type': 'Strong Signal',
                'relevance_score': 9,
                'industry': 'AI & Machine Learning',
                'market_segment': 'Foundation Models',
                'startups': 'None',
                'funding': 'None'
            },
            {
                'title': 'Emerging Startup Raises $50M for AI Agents',
                'source': 'VentureBeat',
                'url': 'https://example.com/2',
                'summary': '- AI agent startup secures Series B\n- Focus on enterprise automation\n- Plans to triple team size',
                'signal_type': 'Weak Signal',
                'relevance_score': 8,
                'industry': 'AI & Machine Learning',
                'market_segment': 'AI Agents',
                'startups': 'AgentCorp: AI automation platform',
                'funding': '$50M Series B led by Sequoia'
            }
        ]
    }
    
    # Generate and save HTML
    html = generate_html_newsletter(test_data)
    save_newsletter_html(html)
    print("✅ Test newsletter generated!")
