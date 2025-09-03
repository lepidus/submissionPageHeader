<?php

/**
 * @file plugins/generic/submissionPageHeader/SubmissionPageHeaderPlugin.php
 *
 * Copyright (c) 2025 SciELO
 * Copyright (c) 2025 Lepidus Tecnologia
 * Distributed under the GNU GPL v3. For full terms see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt
 *
 * @class SubmissionPageHeaderPlugin
 * @ingroup plugins_generic_submissionPageHeader
 *
 */

namespace APP\plugins\generic\submissionPageHeader;

use PKP\plugins\GenericPlugin;
use APP\core\Application;
use APP\facades\Repo;
use PKP\plugins\Hook;

class SubmissionPageHeaderPlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);

        if (Application::isUnderMaintenance()) {
            return true;
        }

        if ($success && $this->getEnabled($mainContextId)) {
            Hook::add('TemplateManager::display', [$this, 'loadResourcesToWorkflow']);
            Hook::add('Template::Workflow', [$this, 'addWorkflowModifications']);
        }

        return $success;
    }

    public function getDisplayName()
    {
        return __('plugins.generic.submissionPageHeader.displayName');
    }

    public function getDescription()
    {
        return __('plugins.generic.submissionPageHeader.description');
    }

    public function loadResourcesToWorkflow($hookName, $params)
    {
        $templateMgr = $params[0];
        $template = $params[1];
        $request = Application::get()->getRequest();

        $request = Application::get()->getRequest();
        $styleSheetUrl = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/styles/sectionViewer.css';
        $templateMgr->addStyleSheet('sectionViewerStyle', $styleSheetUrl, ['contexts' => 'backend']);
    }

    public function addWorkflowModifications($hookName, $params)
    {
        $templateMgr = &$params[1];
        $submission = $templateMgr->getTemplateVars('submission');
        $publication = $submission->getCurrentPublication();

        $section = Repo::section()->get($publication->getData('sectionId'));
        $templateMgr->assign('submissionSection', $section->getLocalizedTitle());

        $templateMgr->registerFilter("output", [$this, 'addSectionViewerFilter']);
    }

    public function addSectionViewerFilter($output, $templateMgr)
    {
        $pattern = '/<tabs default-tab="workflow"/';
        if (preg_match($pattern, $output, $matches, PREG_OFFSET_CAPTURE)) {
            $posBeginning = $matches[0][1];

            $sectionViewerTemplate = $templateMgr->fetch($this->getTemplateResource('sectionViewer.tpl'));

            $output = substr_replace($output, $sectionViewerTemplate, $posBeginning, 0);
            $templateMgr->unregisterFilter('output', [$this, 'addSectionViewerFilter']);
        }
        return $output;
    }
}
