(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const text = (value, fallback = '') => value == null ? fallback : String(value);
  const list = (value) => Array.isArray(value) ? value : [];
  const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const resolveAssetPath = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    return '../' + path.replace(/^\.?\//, '');
  };
  window.resolveAssetPath = resolveAssetPath;

  const safeFilename = (name) => `${text(name, 'Denisa_Elena_Stolniceanu').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}_CV`;
  const contactLink = (label, value, href) => value ? `<span class="contact-item">${escapeHtml(label)}: <a href="${escapeHtml(href || value)}" rel="noopener noreferrer">${escapeHtml(value)}</a></span>` : '';
  const dateRange = (item) => `${escapeHtml(item.startDate || '')}${item.startDate || item.endDate || item.current ? ' – ' : ''}${item.current ? 'Present' : escapeHtml(item.endDate || '')}`;

  function render(data) {
    window._profileData = data;
    const title = data.title || list([data.heroRolePrimary, data.heroRoleSecondary]).filter(Boolean).join(' & ') || 'Professional Profile';
    $('#cv-name').textContent = text(data.name, 'Your Name');
    $('#cv-title').textContent = title;
    $('#contact-block').innerHTML = [
      data.location || data.locationShort ? `<span class="contact-item">${escapeHtml(data.location || data.locationShort)}</span>` : '',
      contactLink('Email', data.email, `mailto:${data.email || ''}`),
      contactLink('LinkedIn', data.linkedinShort || data.linkedin, data.linkedin),
      contactLink('GitHub', data.githubShort || data.github, data.github),
      data.website ? `<span class="contact-item">Web: <a href="${escapeHtml(data.website.startsWith('http') ? data.website : 'https://' + data.website)}" rel="noopener noreferrer">${escapeHtml(data.website)}</a></span>` : ''
    ].filter(Boolean).join('');
    const summary = data.cvSummary || data.summary;
    $('#cv-summary').textContent = summary || 'Professional summary to be added.';
    $('#summary-section').hidden = !summary;

    const experience = $('#experience-list'); experience.innerHTML = '';
    list(data.experience).forEach((item) => {
      const responsibilities = list(item.responsibilities).filter(Boolean).map((value) => `<li>${escapeHtml(value)}</li>`).join('');
      experience.insertAdjacentHTML('beforeend', `<div class="role"><div class="role-head"><div><h4>${escapeHtml(item.title || 'Role')}</h4><div class="role-meta">${escapeHtml(item.company || '')}${item.location ? ` · ${escapeHtml(item.location)}` : ''}</div></div><div class="date">${dateRange(item)}</div></div>${responsibilities ? `<ul>${responsibilities}</ul>` : ''}</div>`);
    });
    $('#experience-section').hidden = !list(data.experience).length;

    const skills = $('#skills-list'); skills.innerHTML = '';
    list(data.skills).forEach((skill) => {
      const tags = list(skill.cvTags || skill.tags).filter(Boolean);
      skills.insertAdjacentHTML('beforeend', `<div class="skill"><strong>${escapeHtml(skill.cvCategory || skill.category || 'Skills')}</strong><span>${escapeHtml(tags.join(' · '))}</span></div>`);
    });
    $('#skills-section').hidden = !list(data.skills).length;

    const certifications = $('#certifications-list'); certifications.innerHTML = '';
    list(data.certifications).forEach((cert) => {
      const logoData = data.issuerLogos && data.issuerLogos[cert.issuer];
      const logo = (logoData && (logoData.cvSrc || logoData.src)) || cert.badgeImage;
      const image = logo ? `<img class="cert-logo" src="${escapeHtml(resolveAssetPath(logo))}" alt="" onerror="this.hidden=true">` : '';
      const href = cert.credentialUrl || cert.certUrl || cert.examUrl;
      const name = cert.fullName || cert.shortName || 'Certification';
      certifications.insertAdjacentHTML('beforeend', `<div class="cert">${image}<strong>${href ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(name)}</a>` : escapeHtml(name)}</strong><small>${escapeHtml(cert.issuer || '')}</small></div>`);
    });
    $('#certifications-section').hidden = !list(data.certifications).length;

    const education = $('#education-list'); education.innerHTML = '';
    list(data.education).forEach((item) => education.insertAdjacentHTML('beforeend', `<div class="education-item"><h4>${escapeHtml(item.degree || '')}</h4><div class="education-meta">${escapeHtml(item.school || '')}${item.location ? ` · ${escapeHtml(item.location)}` : ''}${item.startYear || item.endYear ? ` · ${escapeHtml(item.startYear || '')} – ${escapeHtml(item.endYear || '')}` : ''}${item.status ? ` · ${escapeHtml(item.status)}` : ''}</div></div>`));
    $('#education-section').hidden = !list(data.education).length;

    const languages = $('#languages-list'); languages.innerHTML = '';
    list(data.languages).forEach((item) => languages.insertAdjacentHTML('beforeend', `<span class="language">${escapeHtml(item.name || '')}${item.level ? ` · ${escapeHtml(item.level)}` : ''}</span>`));
    $('#languages-section').hidden = !list(data.languages).length;
    $('#empty-note').hidden = Boolean(summary || list(data.experience).length || list(data.skills).length || list(data.certifications).length || list(data.education).length || list(data.languages).length);
    $('#download-pdf').disabled = false; $('#download-docx').disabled = false;
  }

  function pdfDownload(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' }); const margin = 42; let y = 48;
    const title = data.title || [data.heroRolePrimary, data.heroRoleSecondary].filter(Boolean).join(' & ') || 'Professional Profile';
    const heading = (value) => { y += 19; doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(21,35,55); doc.text(value.toUpperCase(), margin, y); doc.setDrawColor(0,169,113); doc.line(margin, y + 5, 553, y + 5); y += 19; };
    doc.setTextColor(21,35,55); doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.text(text(data.name,'Your Name'), 297, y, {align:'center'}); y += 18; doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.text(title, 297, y, {align:'center'}); y += 14; doc.setFontSize(8); doc.setTextColor(80,98,115); doc.text([data.locationShort || data.location, data.email, data.linkedinShort || data.linkedin, data.githubShort || data.github, data.website].filter(Boolean).join('  ·  '), 297, y, {align:'center'}); y += 10;
    if (data.cvSummary || data.summary) { heading('Professional Summary'); doc.setFontSize(9); doc.setFont('helvetica','normal'); const lines=doc.splitTextToSize(data.cvSummary || data.summary, 511); doc.text(lines, margin, y); y += lines.length*11; }
    list(data.experience).forEach((item, index) => { if (index===0) heading('Professional Experience'); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text(text(item.title,'Role'), margin, y); doc.setFont('helvetica','normal'); doc.text(dateRange(item).replace(/<[^>]+>/g,''), 553, y, {align:'right'}); y += 12; doc.setFontSize(8); doc.setTextColor(80,98,115); doc.text([item.company,item.location].filter(Boolean).join(' · '), margin, y); y += 12; list(item.responsibilities).forEach((r) => { const lines=doc.splitTextToSize('• '+r, 500); doc.text(lines, margin+7, y); y += lines.length*10; }); });
    if (list(data.skills).length) { heading('Technical Skills'); doc.setTextColor(21,35,55); doc.setFontSize(8); const cols=[margin,300]; list(data.skills).forEach((s,i)=>doc.text(`${s.cvCategory||s.category||'Skills'}: ${list(s.cvTags||s.tags).join(', ')}`, cols[i%2], y+Math.floor(i/2)*15)); y += Math.ceil(data.skills.length/2)*15; }
    if (list(data.certifications).length) { heading('Professional Certifications'); doc.setFontSize(8); list(data.certifications).forEach((c,i)=>doc.text(`${c.shortName||c.fullName||'Certification'} — ${c.issuer||''}`, i%2?300:margin, y+Math.floor(i/2)*15)); y += Math.ceil(data.certifications.length/2)*15; }
    if (list(data.education).length) { heading('Education'); doc.setFontSize(9); list(data.education).forEach((e)=>{doc.text(`${e.degree||''} — ${e.school||''}`,margin,y);y+=12;}); }
    if (list(data.languages).length) { heading('Languages'); doc.setFontSize(9); doc.text(list(data.languages).map((l)=>`${l.name||''}${l.level?' · '+l.level:''}`).join('  |  '),margin,y); }
    doc.save(`${safeFilename(data.name)}.pdf`);
  }

  async function docxDownload(data) {
    if (!window.docx) return;
    const d=window.docx; const title=data.title||[data.heroRolePrimary,data.heroRoleSecondary].filter(Boolean).join(' & ')||'Professional Profile'; const children=[new d.Paragraph({text:text(data.name,'Your Name'),heading:d.HeadingLevel.TITLE,alignment:d.AlignmentType.CENTER}),new d.Paragraph({text:title,alignment:d.AlignmentType.CENTER})];
    const section=(name, items)=>{children.push(new d.Paragraph({text:name,heading:d.HeadingLevel.HEADING_2})); items.forEach((item)=>children.push(new d.Paragraph({text:item,bullet:{level:0}})));};
    if(data.cvSummary||data.summary) section('Professional Summary',[data.cvSummary||data.summary]); section('Professional Experience',list(data.experience).map((e)=>`${e.title||'Role'} — ${e.company||''} (${e.current?'Present':e.endDate||''})`)); section('Technical Skills',list(data.skills).map((s)=>`${s.cvCategory||s.category||'Skills'}: ${list(s.cvTags||s.tags).join(', ')}`)); section('Professional Certifications',list(data.certifications).map((c)=>`${c.fullName||c.shortName||'Certification'} — ${c.issuer||''}`)); section('Education',list(data.education).map((e)=>`${e.degree||''} — ${e.school||''}`)); section('Languages',list(data.languages).map((l)=>`${l.name||''}${l.level?' · '+l.level:''}`));
    const blob=await d.Packer.toBlob(new d.Document({sections:[{children}]})); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`${safeFilename(data.name)}.docx`; link.click(); URL.revokeObjectURL(link.href);
  }

  async function loadProfileData() { try { const response=await fetch('../profile-data.json',{cache:'no-cache'}); if(!response.ok) throw new Error(`HTTP ${response.status}`); render(await response.json()); } catch(error) { console.error('Unable to load profile-data.json',error); render({name:'Denisa-Elena Stolniceanu',title:'Professional Profile',experience:[],skills:[],certifications:[],education:[],languages:[]}); } }
  document.addEventListener('DOMContentLoaded',()=>{ const toggle=$('.menu-toggle'); const menu=$('#main-menu'); toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));}); menu.addEventListener('click',(event)=>{if(event.target.closest('a')){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}}); document.addEventListener('keydown',(event)=>{if(event.key==='Escape'){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}}); $('#download-pdf').addEventListener('click',()=>pdfDownload(window._profileData)); $('#download-docx').addEventListener('click',()=>docxDownload(window._profileData)); $('#year').textContent=new Date().getFullYear(); loadProfileData(); });
})();
