"""
AI Watch - Streamlit Frontend
A web-based UI for the Strategic Intelligence Pipeline.
"""
import streamlit as st
import pandas as pd
from datetime import datetime
from collections import Counter
import os
import glob
import io
import re
from pathlib import Path
from fpdf import FPDF

_REPORTS_DIR = str(Path(__file__).resolve().parent.parent / "data" / "reports")

# Import pipeline modules
from ingestion import fetch_sector_news
from summarizer import summarize_articles, INDUSTRY_LIST
from report_generator import generate_markdown_report
from newsletter import send_newsletter, generate_html_newsletter
from powerbi_export import export_all_for_powerbi

# Page config
st.set_page_config(
    page_title="AI Watch - Intelligence Dashboard",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Preset sector queries
PRESET_SECTORS = {
    "AI": "artificial intelligence OR machine learning OR deep learning OR LLM OR GPT OR generative AI",
    "Fintech": "fintech OR digital banking OR cryptocurrency OR blockchain OR payments technology",
    "HealthTech": "digital health OR medtech OR telemedicine OR biotech startup OR healthtech",
    "Cybersecurity": "cybersecurity OR data breach OR zero trust OR threat detection",
    "CleanTech": "renewable energy OR electric vehicle OR cleantech OR sustainability tech",
    "Robotics": "robotics OR automation OR industrial robots OR autonomous systems"
}


def init_session_state():
    """Initialize session state variables."""
    if 'results' not in st.session_state:
        st.session_state.results = None
    if 'report_path' not in st.session_state:
        st.session_state.report_path = None
    if 'pipeline_complete' not in st.session_state:
        st.session_state.pipeline_complete = False


def generate_pdf_from_markdown(md_content, title="AI Watch Report"):
    """Convert markdown content to a modern PDF using fpdf2."""
    
    class ModernPDF(FPDF):
        def __init__(self):
            super().__init__()
            self.set_auto_page_break(auto=True, margin=25)
            self.set_margins(15, 25, 15)
            
        def header(self):
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(230, 126, 34)  # Orange
            self.cell(0, 10, 'AI Watch Intelligence Report', align='C')
            self.ln(5)
            self.set_draw_color(230, 126, 34)
            self.set_line_width(0.5)
            self.line(15, 18, 195, 18)
            self.ln(10)
            
        def footer(self):
            self.set_y(-15)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(128, 128, 128)
            self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')
    
    pdf = ModernPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Page width for calculations
    page_width = 210 - 30  # A4 width minus margins
    
    # Parse markdown and render
    lines = md_content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(3)
            continue
        
        # Clean emoji characters for PDF compatibility
        clean_line = re.sub(r'[^\x00-\x7F]+', '', line).strip()
        if not clean_line:
            continue
        
        # Skip if text is too short after cleaning
        if len(clean_line) < 1:
            continue
            
        # H1 headers
        if line.startswith('# '):
            pdf.set_font('Helvetica', 'B', 18)
            pdf.set_text_color(230, 126, 34)
            text = re.sub(r'^#+\s*', '', clean_line)
            if text:
                pdf.multi_cell(page_width, 10, text)
                pdf.set_draw_color(230, 126, 34)
                pdf.set_line_width(0.8)
                pdf.line(15, pdf.get_y(), 195, pdf.get_y())
                pdf.ln(6)
            
        # H2 headers
        elif line.startswith('## '):
            pdf.set_font('Helvetica', 'B', 14)
            pdf.set_text_color(44, 62, 80)
            text = re.sub(r'^#+\s*', '', clean_line)
            if text:
                pdf.ln(4)
                # Orange left border effect
                y = pdf.get_y()
                pdf.set_fill_color(230, 126, 34)
                pdf.rect(15, y, 2, 8, 'F')
                pdf.set_x(20)
                pdf.multi_cell(page_width - 5, 8, text)
                pdf.ln(2)
            
        # H3 headers
        elif line.startswith('### '):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.set_text_color(52, 73, 94)
            text = re.sub(r'^#+\s*', '', clean_line)
            if text:
                pdf.ln(3)
                pdf.multi_cell(page_width, 7, text)
                pdf.ln(2)
            
        # H4 headers
        elif line.startswith('#### '):
            pdf.set_font('Helvetica', 'B', 11)
            pdf.set_text_color(127, 140, 141)
            text = re.sub(r'^#+\s*', '', clean_line)
            if text:
                pdf.multi_cell(page_width, 6, text)
                pdf.ln(1)
            
        # Horizontal rule
        elif line.startswith('---'):
            pdf.ln(4)
            pdf.set_draw_color(230, 126, 34)
            pdf.set_line_width(0.5)
            pdf.line(15, pdf.get_y(), 195, pdf.get_y())
            pdf.ln(4)
            
        # List items
        elif line.startswith('- ') or line.startswith('* '):
            pdf.set_font('Helvetica', '', 10)
            pdf.set_text_color(51, 51, 51)
            text = clean_line[2:] if len(clean_line) > 2 else ''
            # Bold handling for **text**
            text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
            if text:
                pdf.set_x(20)
                pdf.cell(5, 5, '-', ln=0)
                pdf.multi_cell(page_width - 10, 5, text)
            
        # Regular paragraph
        else:
            pdf.set_font('Helvetica', '', 10)
            pdf.set_text_color(51, 51, 51)
            # Clean markdown formatting
            text = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_line)
            text = re.sub(r'\*([^*]+)\*', r'\1', text)
            text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
            if text and len(text) > 0:
                pdf.multi_cell(page_width, 5, text)
    
    # Output to bytes
    pdf_bytes = pdf.output()
    return bytes(pdf_bytes)


def run_pipeline(topics, max_articles, use_perplexity, export_powerbi, send_email):
    """Run the AI Watch pipeline with progress tracking."""
    
    # Build sector queries
    sector_queries = {}
    for topic in topics:
        if topic in PRESET_SECTORS:
            sector_queries[topic] = PRESET_SECTORS[topic]
        else:
            sector_queries[topic] = topic
    
    progress = st.progress(0)
    status = st.empty()
    
    # Step 1: Fetch news
    status.info("📥 Step 1/4: Fetching news articles...")
    progress.progress(10)
    
    raw_news = fetch_sector_news(
        sector_queries,
        days_back=7,
        max_per_sector=max_articles,
        use_perplexity=use_perplexity
    )
    total_raw = sum(len(articles) for articles in raw_news.values())
    progress.progress(30)
    
    # Step 2: Summarize with AI
    status.info(f"🧠 Step 2/4: Analyzing {total_raw} articles with AI...")
    summarized_data = {}
    
    for i, (sector, articles) in enumerate(raw_news.items()):
        if articles:
            summarized = summarize_articles(articles)
            # Filter out noise
            summarized_data[sector] = [a for a in summarized if a.get('relevance_score', 0) >= 4]
        progress.progress(30 + int(40 * (i + 1) / len(raw_news)))
    
    progress.progress(70)
    
    # Step 3: Generate report
    status.info("📝 Step 3/4: Generating report...")
    report_path = generate_markdown_report(summarized_data, topics=topics)
    progress.progress(80)
    
    # Step 4: Optional exports
    if export_powerbi:
        status.info("📊 Exporting Power BI data...")
        export_all_for_powerbi(summarized_data)
    
    if send_email:
        status.info("📧 Sending newsletter...")
        send_newsletter(summarized_data)
    
    progress.progress(100)
    status.success("✅ Pipeline complete!")
    
    return summarized_data, report_path


def display_executive_summary(data):
    """Display executive summary metrics."""
    total_articles = sum(len(articles) for articles in data.values())
    weak_signals = sum(
        1 for articles in data.values()
        for a in articles if 'Weak' in a.get('signal_type', '')
    )
    high_relevance = sum(
        1 for articles in data.values()
        for a in articles if a.get('relevance_score', 0) >= 8
    )
    startups_found = sum(
        1 for articles in data.values()
        for a in articles if a.get('startups', 'None') != 'None'
    )
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("📰 Total Articles", total_articles)
    with col2:
        st.metric("🔮 Weak Signals", weak_signals)
    with col3:
        st.metric("⭐ High Relevance (8+)", high_relevance)
    with col4:
        st.metric("🚀 Startups Mentioned", startups_found)


def display_industry_breakdown(data):
    """Display industry breakdown chart."""
    industry_counts = Counter()
    for articles in data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
    
    if industry_counts:
        df = pd.DataFrame(
            list(industry_counts.items()),
            columns=['Industry', 'Count']
        ).sort_values('Count', ascending=False)
        
        st.bar_chart(df.set_index('Industry'))


def display_articles_table(data):
    """Display articles in a filterable table."""
    all_articles = []
    for sector, articles in data.items():
        for a in articles:
            all_articles.append({
                'Sector': sector,
                'Title': a.get('title', 'No title'),
                'Industry': a.get('industry', 'Other'),
                'Signal': a.get('signal_type', 'Unknown'),
                'Relevance': a.get('relevance_score', 0),
                'Source': a.get('source', 'Unknown'),
                'Summary': a.get('summary', ''),
                'Startups': a.get('startups', 'None'),
                'Funding': a.get('funding', 'None'),
                'URL': a.get('url', '')
            })
    
    if all_articles:
        df = pd.DataFrame(all_articles)
        
        # Filters
        col1, col2, col3 = st.columns(3)
        with col1:
            signal_filter = st.multiselect(
                "Filter by Signal",
                options=df['Signal'].unique(),
                default=df['Signal'].unique()
            )
        with col2:
            industry_filter = st.multiselect(
                "Filter by Industry",
                options=df['Industry'].unique(),
                default=df['Industry'].unique()
            )
        with col3:
            min_relevance = st.slider("Min Relevance Score", 1, 10, 4)
        
        # Apply filters
        filtered_df = df[
            (df['Signal'].isin(signal_filter)) &
            (df['Industry'].isin(industry_filter)) &
            (df['Relevance'] >= min_relevance)
        ]
        
        st.dataframe(
            filtered_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "URL": st.column_config.LinkColumn("Link"),
                "Relevance": st.column_config.ProgressColumn(
                    "Relevance",
                    min_value=0,
                    max_value=10
                )
            }
        )
        
        # Download button
        csv = filtered_df.to_csv(index=False)
        st.download_button(
            "📥 Download CSV",
            csv,
            "ai_watch_articles.csv",
            "text/csv"
        )


def display_funding_rounds(data):
    """Display funding rounds extracted from articles."""
    funding_data = []
    for sector, articles in data.items():
        for a in articles:
            funding = a.get('funding', 'None')
            if funding and funding != 'None':
                # Parse funding entries
                for entry in funding.split(';'):
                    entry = entry.strip()
                    if '|' in entry:
                        parts = entry.split('|')
                        if len(parts) >= 3:
                            funding_data.append({
                                'Company': parts[0].strip(),
                                'Amount': parts[1].strip() if len(parts) > 1 else 'Undisclosed',
                                'Round': parts[2].strip() if len(parts) > 2 else 'Unknown',
                                'Investors': parts[3].strip() if len(parts) > 3 else '',
                                'Source Article': a.get('title', '')
                            })
    
    if funding_data:
        st.subheader("💰 Funding Rounds")
        df = pd.DataFrame(funding_data)
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No funding rounds detected in this batch.")


def display_key_actors(data):
    """Display key actors mentioned across articles."""
    actors = Counter()
    for articles in data.values():
        for a in articles:
            key_actors = a.get('key_actors', 'None')
            if key_actors and key_actors != 'None':
                for actor in key_actors.split(','):
                    actor = actor.strip()
                    if actor and '(' in actor:
                        # Extract just the name
                        name = actor.split('(')[0].strip()
                        if name:
                            actors[name] += 1
    
    if actors:
        st.subheader("👥 Key Actors")
        df = pd.DataFrame(
            actors.most_common(15),
            columns=['Actor', 'Mentions']
        )
        st.bar_chart(df.set_index('Actor'))


def load_previous_reports():
    """Load list of previous reports sorted by date (newest first)."""
    reports_dir = _REPORTS_DIR
    if os.path.exists(reports_dir):
        reports = glob.glob(os.path.join(reports_dir, "*.md"))
        # Sort by modification time, newest first
        reports.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        return reports
    return []


def main():
    """Main Streamlit app."""
    init_session_state()
    
    # Header
    st.title("🔍 AI Watch - Intelligence Dashboard")
    st.markdown("*Strategic Intelligence Pipeline for Tech Trends*")
    
    # Navigation info
    st.info("📌 **Navigation:** Use the sidebar menu (left) to access Power BI, Newsletter, Reports, and Perplexity pages.")
    
    # Sidebar - Configuration
    with st.sidebar:
        st.header("📋 Topics")
        selected_topics = st.multiselect(
            "Select topics to analyze",
            options=list(PRESET_SECTORS.keys()),
            default=["AI"]
        )
        
        custom_topic = st.text_input("Custom topic", placeholder="Enter custom topic...")
        if custom_topic:
            selected_topics.append(custom_topic)
        
        st.divider()
        
        # Settings
        st.header("⚙️ Settings")
        max_articles = st.slider("Max articles per topic", 5, 30, 10)
        
        use_perplexity = st.checkbox("🔍 Use Perplexity", value=True, help="Real-time web search for latest news")
        
        # Hidden defaults for pipeline (Power BI and Newsletter are separate pages now)
        export_powerbi = False
        send_email = False
        
        st.divider()
        
        # Run button
        run_button = st.button(
            "🚀 Run Pipeline",
            type="primary",
            use_container_width=True,
            disabled=len(selected_topics) == 0
        )
        
        st.divider()
        
        # Previous Reports Section with scrollable container
        st.header("📂 Previous Reports")
        reports = load_previous_reports()
        if reports:
            # Use container with fixed height for scrolling
            with st.container(height=200):
                for i, report_path in enumerate(reports[:10]):
                    report_name = os.path.basename(report_path)
                    # Shorter display name
                    display_name = report_name.replace('ai_watch_report_', '').replace('.md', '')
                    if st.button(f"📄 {display_name}", key=f"report_{i}", use_container_width=True):
                        try:
                            with open(report_path, 'r', encoding='utf-8') as f:
                                st.session_state.selected_report_content = f.read()
                                st.session_state.selected_report_path = report_path
                        except Exception as e:
                            st.error(f"Error: {e}")
        else:
            st.caption("No reports yet")
    
    # Main content area
    if run_button and selected_topics:
        with st.spinner("Running intelligence pipeline..."):
            results, report_path = run_pipeline(
                selected_topics,
                max_articles,
                use_perplexity,
                export_powerbi,
                send_email
            )
            st.session_state.results = results
            st.session_state.report_path = report_path
            st.session_state.pipeline_complete = True
    
    # Display results
    if st.session_state.results:
        data = st.session_state.results
        
        st.header("📊 Executive Summary")
        display_executive_summary(data)
        
        st.divider()
        
        # Tabs for different views
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "🏭 Industry Breakdown",
            "📰 Articles",
            "💰 Funding",
            "👥 Key Actors",
            "📄 Report"
        ])
        
        with tab1:
            display_industry_breakdown(data)
            
            # Market segments
            market_segments = Counter()
            for articles in data.values():
                for a in articles:
                    segment = a.get('market_segment', 'General')
                    if segment and segment != 'General':
                        market_segments[segment] += 1
            
            if market_segments:
                st.subheader("🎯 Top Market Segments")
                df = pd.DataFrame(
                    market_segments.most_common(10),
                    columns=['Segment', 'Count']
                )
                st.bar_chart(df.set_index('Segment'))
        
        with tab2:
            display_articles_table(data)
        
        with tab3:
            display_funding_rounds(data)
        
        with tab4:
            display_key_actors(data)
        
        with tab5:
            if st.session_state.report_path:
                try:
                    with open(st.session_state.report_path, 'r', encoding='utf-8') as f:
                        report_content = f.read()
                    st.markdown(report_content)
                    
                    st.divider()
                    st.subheader("📥 Download Report")
                    
                    # Download buttons
                    col1, col2 = st.columns(2)
                    with col1:
                        st.download_button(
                            "📝 Download Markdown",
                            report_content,
                            os.path.basename(st.session_state.report_path),
                            "text/markdown",
                            use_container_width=True
                        )
                    with col2:
                        # Generate PDF
                        with st.spinner("Generating PDF..."):
                            pdf_data = generate_pdf_from_markdown(report_content)
                        pdf_filename = os.path.basename(st.session_state.report_path).replace('.md', '.pdf')
                        st.download_button(
                            "📄 Download PDF",
                            pdf_data,
                            pdf_filename,
                            "application/pdf",
                            use_container_width=True
                        )
                except Exception as e:
                    st.error(f"Error loading report: {e}")
    
    # Show selected previous report
    elif hasattr(st.session_state, 'selected_report_content') and st.session_state.selected_report_content:
        st.header("📄 Report Preview")
        
        # Clear button
        if st.button("← Back to Dashboard"):
            st.session_state.selected_report_content = None
            st.session_state.selected_report_path = None
            st.rerun()
        
        st.markdown(st.session_state.selected_report_content)
        
        st.divider()
        st.subheader("📥 Download Report")
        
        # Download buttons for previous report
        col1, col2 = st.columns(2)
        with col1:
            report_path = getattr(st.session_state, 'selected_report_path', 'report.md')
            st.download_button(
                "📝 Download Markdown",
                st.session_state.selected_report_content,
                os.path.basename(report_path),
                "text/markdown",
                use_container_width=True
            )
        with col2:
            # Generate PDF
            with st.spinner("Generating PDF..."):
                pdf_data = generate_pdf_from_markdown(st.session_state.selected_report_content)
            pdf_filename = os.path.basename(report_path).replace('.md', '.pdf')
            st.download_button(
                "📄 Download PDF",
                pdf_data,
                pdf_filename,
                "application/pdf",
                use_container_width=True
            )
    
    else:
        # Welcome message
        st.info("👈 Select topics and click **Run Pipeline** to start analyzing tech news, or select a previous report from the sidebar.")
        
        # Quick stats
        col1, col2, col3 = st.columns(3)
        
        reports = load_previous_reports()
        with col1:
            st.metric("📂 Reports Generated", len(reports))
        
        with col2:
            # Check for API keys
            from dotenv import load_dotenv
            load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")
            perplexity_configured = bool(os.getenv('PERPLEXITY_API_KEY'))
            st.metric("🔍 Perplexity", "✅ Ready" if perplexity_configured else "❌ Not Set")
        
        with col3:
            smtp_configured = bool(os.getenv('SMTP_HOST'))
            st.metric("📧 Newsletter", "✅ Ready" if smtp_configured else "❌ Not Set")


if __name__ == "__main__":
    main()
