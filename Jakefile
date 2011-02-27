# Reads the license file and returns its contents formatted as
# a multiline JavaScript comment for embedding in source code
jake_helper :license do
  "/**\n" + File.read('LICENSE').split(/\n/).map { |line|
    " * #{ line }"
  }.join("\n") + "\n */"
end

jake_hook :build_complete do |build|
  %w[CHANGELOG LICENSE].each do |doc|
    FileUtils.cp doc, "#{build.build_directory}/#{doc}"
  end
  
  FileUtils.cp 'README.markdown', "#{build.build_directory}/README"
  
  build.packages.each do |doc|
    FileUtils.cp build.package(doc).build_path(:min), "site/site/javascripts/js.class/#{doc}.js"
  end
  
  [:src, :min].each do |size|
    FileUtils.rm_rf "#{build.build_directory}/#{size}/assets"
    FileUtils.cp_r "source/assets", "#{build.build_directory}/#{size}/assets"
  end
end

