import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../models';

@Component({
  templateUrl: './terms-conditions.component.html',
})
export class TermsConditionsComponent implements AfterViewInit {

  @Select('userLogin', 'employerInfo')
  readonly userData$: Observable<ResponseModel>;

  @ViewChild('tnc')
  private readonly tnc: ElementRef<HTMLElement>;

  private staticData = `<p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Jobseeker Terms and
  Conditions:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Terms of use</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size: 10.5pt; font-family: Arial; color: black;">www.Jobharu.com</span></b><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;mso-fareast-font-family:
  &quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">&nbsp;(the “Site”) is owned and operated
  by&nbsp;</span><b><span style="font-family: Arial;">Help Inc. Pvt. Ltd</span></b><span style="font-family: Arial;">&nbsp;and is made available to you on the
  following terms and conditions. By using the site and the services available on
  it you are deemed to accept these terms and conditions and any additional terms
  and conditions which expressly apply to services and information provided by
  third parties.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Who we are:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Help Inc. Pvt Ltd is one
  of the leading legally certified Human Resource consulting firm operating since
  2018. Jobharu offers multiple solutions in the field of HR, Recruitment and
  Placement services to different organizations in diversified fields like
  Financial Institutions, Corporate houses, Trading houses, Schools, Colleges,
  I/NGOs etc. Jobharu is morally operating by following the principles where
  value of clients are highly understood and recognized to provide them with the
  best services. Jobharu is also known for its professional training services to
  produce qualified and skilled manpower in diverse fields.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Data protection:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Our use of CVs and other
  personal information supplied by users of this Site is governed by our Privacy
  policy. </span><u><a href="https://www.jobharu.com/privacy-policy"><span style="color: black; font-family: Arial;">Please click here to view our Privacy policy</span></a></u><b><span style="font-family: Arial;">.</span></b><o:p></o:p></span></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Personal data which you
  supply to us may be transferred to third party service providers to be stored
  or processed on our behalf, including third parties located outside of the
  European Economic Area in countries where there may be a lower legal level of data
  protection. However, we will always endeavor to handle your information in
  accordance with this privacy policy, wherever it is processed.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Use of the Site:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">The information and
  services available on the site are provided for the sole purpose of individuals
  looking for employment opportunities and career information and for employers
  seeking to recruit staff. You may use, print and download information from the
  site for these purposes only and for no other personal or commercial purpose.
  You may not otherwise copy, display, transmit or distribute any material from
  the site and if you do or if you perform any other unauthorized processing of
  information on the site it shall be deemed a material breach of these terms and
  conditions which, in the case of a Customer, shall entitle us to terminate the
  Services immediately on notice in writing. Further, we reserve the right to
  suspend provision of the Services to you in circumstances where we reasonably
  believe that you have performed any unauthorized processing of information. All
  copyright, database rights and other intellectual property rights in the site
  and the material available on the site belong to us. Use of the site does not
  give you any proprietary rights in such materials.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">What’s in these terms?</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">These jobseeker terms
  set out the information applicable to jobseekers who wish to use&nbsp;the Site
  and apply to the contractual agreement (hereinafter referred to as the
  “Agreement”) between Us and You.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">By using the Site you
  accept these terms:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">By using the Site, you
  confirm that you accept these Jobseeker Terms and that you agree to comply with
  them.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">If you do not agree to
  these Jobseeker Terms, you must not use the Site.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">We recommend that you
  print a copy of these Jobseeker Terms for future reference.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Object of the agreement
  and scope of the Services:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">We offer a variety of
  career services via the Platforms. We want to be your lifelong career
  assistant. If your life perspective changes, you are developing or reaching for
  new goals, we offer the right career support. We aim to build a long-lasting
  relationship, to build a product and a Service, that is available 7 days a
  week, 24 hours a day and which enables you to take your life and future in your
  own hands.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">a. Job alerts</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">You can subscribe to job
  alerts through our Platforms. That means you will then regularly receive job
  alerts about listings which match your criteria. You can create job alerts
  manually which match a profile that has been defined by you in advance. If you
  also register or have registered an account, you can manage the job alerts
  described below in section c.ee.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">b. Your Account</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Certain Services will
  only be available as part of an account on the Site.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">If you enter into an
  agreement for an account, you can use additional Services as described hereinafter.
  You can register for an account as described in section 3.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">c. Saved Jobs</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">You can save job ads
  that you have viewed, e.g. by clicking the respective button in the job ad. You
  will then be able to access such saved listings in your account.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">d. Your Profile</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">You can create a
  CV-profile (“Profile”) within your account, which will consist of various CV
  related information as well as attachments provided by you.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">e. Application
  Preservation</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Within your account we
  store your applications once you create your Account.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">f. Assurance of
  confidentiality of your CV to be only kept by US</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;"><span style="font-family: Arial;">The information and data related to
  you will only be kept by us and won’t be provided to third party until and
  unless they wish to see candidates or applications by purchasing certain CV
  from us.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:17.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">g. Searching, Applying
  and Getting Jobs is absolutely free</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Jobharu is a foundation
  who tends to encourage people to apply for jobs through our portal as we have
  quality jobs. Since we respect the value of jobseekers and their willingness to
  get a job, we don’t charge any amount from them.</span><o:p></o:p></span></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">&nbsp;</span><o:p></o:p></span></p><p class="MsoNormal" style="margin: 15pt 0in 8.4pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><b><span style="font-size:19.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">There are other terms
  that may apply to you:</span><o:p></o:p></span></b></p><p class="MsoNormal" style="margin-bottom: 7.5pt; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">This Acceptable Use
  Policy refers to the following additional terms, which also apply to your use
  of the Site:</span><o:p></o:p></span></p><p class="MsoNormal" style="margin-left: 0in; text-indent: -0.25in; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><!--[if !supportLists]--><span style="font-size:10.0pt;mso-bidi-font-size:10.5pt;font-family:Symbol;
  mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black"><span style="font-family: Arial;">·</span><span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: Arial;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </span></span><!--[endif]--><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Our&nbsp;</span><u><a href="https://www.jobharu.com/privacy-policy"><span style="color: black; font-family: Arial;">Privacy
  policy</span></a></u><span style="font-family: Arial;">, which sets out the terms on which we process any
  personal data we collect from you, or that you provide to Us. By using the
  Site, you consent to such processing and you warrant that all data provided by
  you is accurate;</span><o:p></o:p></span></p><p style="margin: 0in 0in 15pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span><span style="font-family: Arial;">

  </span></p><p class="MsoNormal" style="margin-left: 0in; text-indent: -0.25in; line-height: normal; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><!--[if !supportLists]--><span style="font-size:10.0pt;mso-bidi-font-size:10.5pt;font-family:Symbol;
  mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black"><span style="font-family: Arial;">·</span><span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: Arial;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </span></span><!--[endif]--><span style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;
  mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="font-family: Arial;">Our&nbsp;</span><u><a href="https://www.jobharu.com/privacy-policy"><span style="color: black; font-family: Arial;">Cookie
  policy</span></a></u><span style="font-family: Arial;">, which sets out information about the cookies on the
  Site;</span><o:p></o:p></span></p>`;

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  private initQuillData(el: HTMLElement, d: string) {

    if (!el || (d || '') === '') return;
    const ql = new Quill(el, {
      readOnly: true,
      modules: {
        toolbar: false
      }
    });
    ql.setContents(JSON.parse(d));
  }

  ngAfterViewInit() {

    this.userData$.pipe(
      tap(_ => _ && _.contentBody !== '' ? '' : this.tnc.nativeElement.innerHTML = this.staticData),
      filter(_ => _ && _.contentBody),
      map(_ => ({ ...<UsersModel>_.contentBody })),
    ).subscribe({
      next: model => this.initQuillData(this.tnc.nativeElement, model.terms)
    });
  }

}
